import json
import os
import subprocess
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent

HTML_FILES = [
    "index.html",
    "packages.html",
    "work.html",
    "sortinghats.html",
    "paotang.html",
    "404.html",
    "demos/shop.html",
    "demos/clinic.html",
    "demos/cafe.html",
]

REWRITES = {
    "/": "index.html",
    "/work": "work.html",
    "/packages": "packages.html",
}

VOID_ELEMENTS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr"
}


class PortfolioHTMLInspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.routes = set()
        self.links = []          # (tag, attr, val, line)
        self.bilingual_nodes = []  # (tag, attrs_dict, line, has_child_tags)
        self.placeholder_nodes = []  # (tag, attrs_dict, line)
        self.scripts = []        # (script_type, content, line)
        self.elements = []       # (tag, attrs_dict, line)
        self._data_en_stack = [] # stack of dicts tracking open [data-en] elements
        self._in_script = False
        self._script_type = ""
        self._script_start_line = 0
        self._script_buf = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        line = self.getpos()[0]
        self.elements.append((tag, attr_dict, line))

        # If currently inside a [data-en] element, mark that it contains a child HTML tag
        if self._data_en_stack:
            for item in self._data_en_stack:
                item["has_child_tags"] = True

        if "id" in attr_dict and attr_dict["id"]:
            self.ids.add(attr_dict["id"])
        if "data-route" in attr_dict and attr_dict["data-route"]:
            self.routes.add(attr_dict["data-route"])

        if tag == "a" and "href" in attr_dict:
            self.links.append(("a", "href", attr_dict["href"], line))
        elif tag == "img" and "src" in attr_dict:
            self.links.append(("img", "src", attr_dict["src"], line))
        elif tag == "link" and "href" in attr_dict:
            rel = attr_dict.get("rel", "")
            if "stylesheet" in rel or "icon" in rel:
                self.links.append(("link", "href", attr_dict["href"], line))
        elif tag == "script" and "src" in attr_dict:
            self.links.append(("script", "src", attr_dict["src"], line))

        if "data-en-placeholder" in attr_dict or "data-th-placeholder" in attr_dict:
            self.placeholder_nodes.append((tag, attr_dict, line))

        has_bilingual = ("data-en" in attr_dict) or ("data-th" in attr_dict)
        if has_bilingual:
            entry = {
                "tag": tag,
                "attrs": attr_dict,
                "line": line,
                "has_child_tags": False,
            }
            self.bilingual_nodes.append(entry)
            if tag not in VOID_ELEMENTS:
                self._data_en_stack.append(entry)

        if tag == "script" and "src" not in attr_dict:
            self._in_script = True
            self._script_type = attr_dict.get("type", "").strip().lower()
            self._script_start_line = line
            self._script_buf = []

    def handle_endtag(self, tag):
        if self._in_script and tag == "script":
            self.scripts.append((
                self._script_type,
                "".join(self._script_buf),
                self._script_start_line,
            ))
            self._in_script = False
            self._script_buf = []

        if self._data_en_stack and self._data_en_stack[-1]["tag"] == tag:
            self._data_en_stack.pop()

    def handle_data(self, data):
        if self._in_script:
            self._script_buf.append(data)


def parse_html_file(rel_path: str) -> PortfolioHTMLInspector:
    inspector = PortfolioHTMLInspector()
    content = (ROOT / rel_path).read_text(encoding="utf-8")
    inspector.feed(content)
    return inspector


class TestPortfolioIntegrity(unittest.TestCase):
    def test_local_assets_exist(self):
        """Every local img[src], link[href], script[src], and local a[href] must exist on disk."""
        for rel_path in HTML_FILES:
            file_path = ROOT / rel_path
            self.assertTrue(file_path.exists(), f"Expected HTML file missing: {rel_path}")
            inspector = parse_html_file(rel_path)
            base_dir = file_path.parent

            for tag, attr, val, line in inspector.links:
                if not val or val.startswith(("#", "http://", "https://", "mailto:", "tel:", "javascript:", "data:")):
                    continue
                parsed = urlparse(val)
                path_part = parsed.path
                if not path_part:
                    continue

                if path_part in REWRITES:
                    target = ROOT / REWRITES[path_part]
                elif path_part.startswith("/"):
                    target = ROOT / path_part.lstrip("/")
                else:
                    target = (base_dir / path_part).resolve()

                self.assertTrue(
                    target.exists(),
                    f"{rel_path}:{line} broken local {tag}[{attr}]='{val}' -> {target}",
                )

    def test_internal_anchors_and_spa_routes(self):
        """Every #anchor must match an id attribute, and #/... SPA routes in clinic.html must match data-route."""
        for rel_path in HTML_FILES:
            inspector = parse_html_file(rel_path)
            for tag, attr, val, line in inspector.links:
                if not val.startswith("#") or val == "#":
                    continue
                if val.startswith("#/"):
                    route_name = val[1:]
                    self.assertIn(
                        route_name,
                        inspector.routes,
                        f"{rel_path}:{line} SPA route '{val}' has no matching [data-route='{route_name}']",
                    )
                else:
                    anchor_id = val[1:]
                    self.assertIn(
                        anchor_id,
                        inspector.ids,
                        f"{rel_path}:{line} internal anchor '{val}' has no matching id='{anchor_id}'",
                    )

    def test_bilingual_parity_and_no_nested_clobber(self):
        """Every [data-en] must have [data-th] (and vice versa), placeholders must match, and no [data-en] wraps child HTML tags."""
        for rel_path in HTML_FILES:
            inspector = parse_html_file(rel_path)
            for node in inspector.bilingual_nodes:
                attrs = node["attrs"]
                line = node["line"]
                tag = node["tag"]
                self.assertIn(
                    "data-en",
                    attrs,
                    f"{rel_path}:{line} <{tag}> has data-th without data-en",
                )
                self.assertIn(
                    "data-th",
                    attrs,
                    f"{rel_path}:{line} <{tag}> has data-en without data-th",
                )
                self.assertFalse(
                    node["has_child_tags"],
                    f"{rel_path}:{line} <{tag} data-en='{attrs.get('data-en', '')[:30]}'> wraps child HTML tags and will clobber them on language switch",
                )

            for tag, attrs, line in inspector.placeholder_nodes:
                self.assertIn(
                    "data-en-placeholder",
                    attrs,
                    f"{rel_path}:{line} <{tag}> has data-th-placeholder without data-en-placeholder",
                )
                self.assertIn(
                    "data-th-placeholder",
                    attrs,
                    f"{rel_path}:{line} <{tag}> has data-en-placeholder without data-th-placeholder",
                )

    def test_work_html_fastwork_compliance(self):
        """work.html must have zero external contact channels or links back to packages.html / index.html."""
        inspector = parse_html_file("work.html")
        forbidden_substrings = (
            "mailto:",
            "tel:",
            "line.me",
            "instagram.com",
            "github.com",
            "linkedin.com",
            "youtube.com",
            "packages.html",
            "/packages",
            "index.html",
        )
        for tag, attr, val, line in inspector.links:
            lower_val = val.lower()
            for forbidden in forbidden_substrings:
                self.assertNotIn(
                    forbidden,
                    lower_val,
                    f"Fastwork compliance violation in work.html:{line}: found '{forbidden}' in {tag}[{attr}]='{val}'",
                )

    def test_js_and_json_syntax(self):
        """All JS files, inline JS scripts, and JSON configs must be syntactically valid."""
        json_files = [
            "vercel.json",
            "package.json",
            "sorting-hat/pyscript.json",
        ]
        for jf in json_files:
            path = ROOT / jf
            self.assertTrue(path.exists(), f"Missing JSON config: {jf}")
            with path.open(encoding="utf-8") as f:
                json.load(f)

        site_js = ROOT / "assets/site.js"
        self.assertTrue(site_js.exists(), "Missing assets/site.js")
        res = subprocess.run(["node", "-c", str(site_js)], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"Syntax error in assets/site.js:\n{res.stderr}")

        ignored_script_types = {"py", "text/python", "application/json", "application/ld+json", "importmap"}
        for rel_path in HTML_FILES:
            inspector = parse_html_file(rel_path)
            for script_type, code, line in inspector.scripts:
                if script_type in ignored_script_types:
                    continue
                with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tmp:
                    tmp.write(code)
                    tmp_path = tmp.name
                try:
                    res = subprocess.run(["node", "-c", tmp_path], capture_output=True, text=True)
                    self.assertEqual(
                        res.returncode,
                        0,
                        f"JS syntax error in {rel_path} (script at line {line}):\n{res.stderr}",
                    )
                finally:
                    os.unlink(tmp_path)

    def test_owl_post_inquiry_form(self):
        """index.html must include #owl-form with bilingual placeholders, package options, and #owl-status live region."""
        inspector = parse_html_file("index.html")
        for req_id in ("owl-form", "owl-name", "owl-reply", "owl-pkg", "owl-msg", "owl-status"):
            self.assertIn(req_id, inspector.ids, f"Missing #{req_id} in index.html")

        status_elems = [
            attrs for tag, attrs, _ in inspector.elements if attrs.get("id") == "owl-status"
        ]
        self.assertEqual(len(status_elems), 1)
        self.assertEqual(status_elems[0].get("role"), "status")
        self.assertEqual(status_elems[0].get("aria-live"), "polite")

        for field_id in ("owl-name", "owl-reply", "owl-msg"):
            elems = [attrs for tag, attrs, _ in inspector.elements if attrs.get("id") == field_id]
            self.assertEqual(len(elems), 1)
            self.assertIn("data-en-placeholder", elems[0], f"#{field_id} missing data-en-placeholder")
            self.assertIn("data-th-placeholder", elems[0], f"#{field_id} missing data-th-placeholder")

    def test_case_study_dialog_and_triggers(self):
        """index.html must include <dialog id='case-dialog'> and [data-case] triggers for spell-1..spell-6."""
        inspector = parse_html_file("index.html")
        self.assertIn("case-dialog", inspector.ids, "Missing <dialog id='case-dialog'> in index.html")
        self.assertIn("case-title", inspector.ids, "Missing #case-title inside case study dialog")

        dialogs = [
            attrs for tag, attrs, _ in inspector.elements
            if tag == "dialog" and attrs.get("id") == "case-dialog"
        ]
        self.assertEqual(len(dialogs), 1)
        self.assertEqual(dialogs[0].get("aria-labelledby"), "case-title")

        case_triggers = [
            attrs.get("data-case")
            for tag, attrs, _ in inspector.elements
            if tag == "button" and "data-case" in attrs
        ]
        expected = [f"spell-{i}" for i in range(1, 7)]
        self.assertEqual(
            case_triggers,
            expected,
            f"Expected 6 case study buttons {expected}, found {case_triggers}",
        )


if __name__ == "__main__":
    unittest.main()
