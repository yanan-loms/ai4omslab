(function () {
    var isCn = (document.documentElement.lang || "").toLowerCase().indexOf("zh") === 0;
    var pack = isCn ? "cn" : "en";
    var root = document.getElementById("member-profile-root");
    if (!root) return;

    var params = new URLSearchParams(location.search);
    var id = params.get("id");
    if (id === "zhu-yanan") {
        location.replace("pi.html");
        return;
    }
    var member = (window.LOMS_MEMBERS || {})[id];
    var byNum = {};
    (window.LOMS_PAPERS || []).forEach(function (paper) {
        byNum[paper.num] = paper;
    });

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function chips(items) {
        var ul = el("ul", "flex flex-wrap gap-2 list-none");
        items.forEach(function (item) {
            ul.appendChild(el("li", "rounded-full border px-3 py-1 text-sm", item));
        });
        return ul;
    }

    function renderPaperGroup(title, items) {
        root.appendChild(el("h2", "mt-10 mb-4 text-2xl md:text-4xl text-primary", title));
        var year = null;
        var ul = null;
        items.forEach(function (paper) {
            if (paper.year !== year) {
                year = paper.year;
                root.appendChild(el("h3", "mt-6 mb-2 text-xl text-primary", year));
                ul = el("ul", "list-disc pl-5 member-papers");
                root.appendChild(ul);
            }
            var li = el("li", "mb-4");
            var titleP = document.createElement("p");
            titleP.className = "font-semibold";
            titleP.innerHTML = paper.num + ". " + paper.titleHtml;
            var authors = document.createElement("p");
            authors.innerHTML = paper.authorsHtml;
            var venue = el("p", "italic", paper.venue);
            li.appendChild(titleP);
            li.appendChild(authors);
            li.appendChild(venue);
            var notes = member.paperNotes && member.paperNotes[String(paper.num)];
            if (notes && notes[pack]) {
                li.appendChild(el("p", "text-sm text-gray-500", notes[pack]));
            }
            if (paper.link) {
                var link = el("a", "text-[#007aff]", "Link");
                link.href = paper.link;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                li.appendChild(link);
            }
            ul.appendChild(li);
        });
    }

    if (!member || !member[pack]) {
        root.appendChild(el("p", "text-gray-500", isCn ? "未找到该成员页面。" : "This member profile is not available."));
        var missing = el("a", "text-[#007aff] text-sm", isCn ? "返回成员列表" : "Back to members");
        missing.href = "members.html";
        root.appendChild(missing);
        return;
    }

    var view = member[pack];
    var heading = document.getElementById("page-section-title");
    if (heading) heading.textContent = view.name;
    document.title = view.name + " - LOMS";

    var back = el("a", "text-[#007aff] text-sm", isCn ? "返回成员列表" : "Back to members");
    back.href = view.backHref || "members.html";
    root.appendChild(back);

    (view.roles || []).forEach(function (role) {
        root.appendChild(el("p", "text-gray-500 text-center mt-2", role));
    });

    (view.links || []).forEach(function (item) {
        var link = el("a", "text-[#007aff] text-sm block text-center mt-2", item.text);
        link.href = item.href;
        if (item.external) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }
        root.appendChild(link);
    });

    root.appendChild(el("h2", "mt-10 mb-4 text-2xl md:text-4xl text-primary", isCn ? "研究兴趣" : "Research interests"));

    var stated = view.stated || [];
    var draft = view.draft || [];
    if (!stated.length && !draft.length) {
        root.appendChild(el("p", "text-gray-500", isCn ? "研究兴趣待补充" : "Research interests to be added"));
    } else {
        if (stated.length) {
            root.appendChild(el("p", "text-sm text-gray-500 mb-2", isCn ? "组内已有表述" : "Stated in group materials"));
            root.appendChild(chips(stated));
        }
        if (draft.length) {
            root.appendChild(el(
                "p",
                "text-sm text-gray-500 mt-4 mb-2",
                isCn ? "论文主题草稿（待确认，并非已核定课题）" : "Review draft from authored papers — not a confirmed assignment"
            ));
            root.appendChild(chips(draft));
        }
    }

    var chosen = (member.papers || []).map(function (num) {
        return byNum[num];
    }).filter(Boolean);
    chosen.sort(function (a, b) {
        return b.num - a.num;
    });
    var publications = chosen.filter(function (paper) { return !paper.preprint; });
    var preprints = chosen.filter(function (paper) { return paper.preprint; });

    if (!publications.length && !preprints.length) {
        root.appendChild(el("h2", "mt-10 mb-4 text-2xl md:text-4xl text-primary", isCn ? "论文" : "Publications"));
        root.appendChild(el("p", "text-gray-500", isCn ? "暂无已核实的论文记录" : "No verified publications listed yet"));
        return;
    }
    if (publications.length) renderPaperGroup(isCn ? "论文" : "Publications", publications);
    if (preprints.length) renderPaperGroup(isCn ? "预印本" : "Preprints", preprints);
})();
