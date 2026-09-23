# パラメータ一覧（Parameter）

制度の計算に使う金額・率などの値（Parameter）の一覧です。
`openfisca_japan/parameters/` 配下の YAML から **自動抽出**しています
（生成方法は[開発ドキュメント](./dev_note.md#制度ドキュメントの生成)を参照）。

パラメータは日付ごとに値を持ちます。制度改正で金額が変わった場合は複数の行が表示されます。

{% assign items = site.data.parameters.items %}
{% assign groups = items | group_by: "category" | sort: "name" %}

全 **{{ items | size }}** 項目

<input type="search" id="of-filter" placeholder="パラメータ名・説明で絞り込み（例: 控除、児童手当）" aria-label="パラメータの絞り込み">
<p id="of-filter-result" role="status"></p>

{% for group in groups %}
<h2 class="of-category">{{ group.name }}<span class="of-count">{{ group.items | size }}</span></h2>

{% assign sorted = group.items | sort: "name" %}
{% for item in sorted %}
<details class="of-item" data-search="{{ item.name | append: ' ' | append: item.description | append: ' ' | append: item.category | strip_newlines | escape }}">
<summary><code>{{ item.name }}</code>{% if item.description and item.description != item.name %} — {{ item.description }}{% endif %}{% if item.unit %} <span class="of-tag">{{ item.unit }}</span>{% endif %}</summary>

<table>
<thead><tr><th>適用開始日</th><th>値</th></tr></thead>
<tbody>
{% for value in item.values %}
<tr><td><code>{{ value.date }}</code></td><td>{% if value.value.first %}{% for element in value.value %}{{ element }}{% unless forloop.last %}, {% endunless %}{% endfor %}{% else %}{{ value.value }}{% endif %}</td></tr>
{% endfor %}
</tbody>
</table>

<dl>
{% if item.reference %}<dt>参照</dt><dd><a href="{{ item.reference }}">{{ item.reference }}</a></dd>{% endif %}
<dt>ソース</dt><dd><a href="{{ site.source_base_url }}/{{ item.source }}"><code>{{ item.source }}</code></a></dd>
</dl>
</details>
{% endfor %}
{% endfor %}

<style>
#of-filter { width: 100%; padding: .6em .8em; font-size: 1rem; box-sizing: border-box; margin-bottom: .5em; }
#of-filter-result { color: #606c71; font-size: .9rem; margin: 0 0 1em; }
.of-category { border-bottom: 1px solid #e9ebec; padding-bottom: .2em; }
.of-count { float: right; font-size: .7em; color: #606c71; font-weight: normal; }
.of-item { border-left: 3px solid #e9ebec; padding: .3em 0 .3em .8em; margin: .35em 0; }
.of-item > summary { cursor: pointer; }
.of-item[open] { border-left-color: #159957; }
.of-item table { margin: .6em 0; display: table; }
.of-item dl { margin: .6em 0 .2em; }
.of-item dt { font-weight: bold; font-size: .85rem; color: #606c71; }
.of-item dd { margin: 0 0 .5em; }
.of-tag { font-size: .7rem; padding: .1em .5em; border-radius: 1em; background: #e9ebec; color: #1e6bb8; white-space: nowrap; }
.of-hidden { display: none; }
</style>

<script>
(function () {
  var box = document.getElementById("of-filter");
  var status = document.getElementById("of-filter-result");
  var items = Array.prototype.slice.call(document.querySelectorAll(".of-item"));
  var categories = Array.prototype.slice.call(document.querySelectorAll(".of-category"));

  function apply() {
    var query = box.value.trim().toLowerCase();
    var shown = 0;
    items.forEach(function (item) {
      var hit = query === "" || item.dataset.search.toLowerCase().indexOf(query) !== -1;
      item.classList.toggle("of-hidden", !hit);
      item.open = hit && query !== "";
      if (hit) { shown += 1; }
    });
    categories.forEach(function (heading) {
      var visible = false;
      var node = heading.nextElementSibling;
      while (node && !node.classList.contains("of-category")) {
        if (node.classList.contains("of-item") && !node.classList.contains("of-hidden")) {
          visible = true;
          break;
        }
        node = node.nextElementSibling;
      }
      heading.classList.toggle("of-hidden", !visible);
    });
    status.textContent = query === "" ? "" : shown + " 件が一致しました";
  }

  box.addEventListener("input", apply);
})();
</script>
