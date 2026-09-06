(function (root) {
  function portfolioStatusLabel(status) {
    return {
      planned: "Planned",
      active: "Active",
      completed: "Completed",
    }[status] || "Active";
  }

  function inferPortfolioStatus(startDate, endDate, today) {
    const todayIso = today || new Date().toISOString().slice(0, 10);
    if (startDate && startDate > todayIso) {
      return "planned";
    }
    if (endDate && endDate < todayIso) {
      return "completed";
    }
    if (startDate || endDate) {
      return "active";
    }
    return "planned";
  }

  function portfolioEffectiveStatus(item, today) {
    if (item && item.statusMode === "auto") {
      return inferPortfolioStatus(item.startDate, item.endDate, today);
    }
    return ["planned", "active", "completed"].includes(item && item.status) ? item.status : "active";
  }

  function withPortfolioEffectiveStatus(item, today) {
    if (!item) return item;
    const status = portfolioEffectiveStatus(item, today);
    return status === item.status ? item : { ...item, status };
  }

  function portfolioTypeLabel(type) {
    return {
      competition: "Competition",
      course: "Course",
      project: "Project",
    }[type] || "Project";
  }

  function portfolioDateRange(item, formatter) {
    const format = (iso) => {
      if (!iso) return "";
      if (formatter && typeof formatter.format === "function") {
        return formatter.format(new Date(`${iso}T00:00:00`));
      }
      return iso;
    };
    const start = format(item.startDate);
    const end = format(item.endDate);
    if (start && end) {
      return `${start} - ${end}`;
    }
    return start || end || "No dates";
  }

  function renderPortfolioLinks(target, rawLinks) {
    if (!target) return;
    target.innerHTML = "";
    const links = String(rawLinks || "")
      .split(/[\n,]+/)
      .map((link) => link.trim())
      .filter(Boolean)
      .slice(0, 4);

    links.forEach((link, index) => {
      const anchor = document.createElement("a");
      anchor.href = link.startsWith("http://") || link.startsWith("https://") ? link : `https://${link}`;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.textContent = index === 0 ? "Link" : `Link ${index + 1}`;
      target.appendChild(anchor);
    });
  }

  function renderPortfolioCard(item, { dom, utils, onOpenDetail, onDragStart, onDragEnd }) {
    if (!dom.portfolioItemTemplate) return document.createElement("div");
    const fragment = dom.portfolioItemTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".portfolio-card");
    const type = fragment.querySelector(".portfolio-card__type");
    const dates = fragment.querySelector(".portfolio-card__dates");
    const cert = fragment.querySelector(".portfolio-card__cert");
    const title = fragment.querySelector(".portfolio-card__title");
    const meta = fragment.querySelector(".portfolio-card__meta");
    const achievement = fragment.querySelector(".portfolio-card__achievement");
    const viewButton = fragment.querySelector(".portfolio-card__view");

    card.dataset.id = item.id;
    card.draggable = true;
    card.classList.add(`portfolio-card--${item.type}`);
    type.textContent = portfolioTypeLabel(item.type);
    dates.textContent = portfolioDateRange(item, utils.shortDateFormatter);
    cert.hidden = !item.cert;
    title.textContent = item.title || "Untitled";
    meta.hidden = true;
    achievement.textContent = item.achievement ? `Achievement: ${item.achievement}` : "";
    achievement.hidden = !item.achievement;

    card.addEventListener("click", (event) => {
      if (event.target.closest("button") || event.target.closest("a")) {
        return;
      }
      if (typeof onOpenDetail === "function") {
        onOpenDetail(item.id);
      }
    });

    card.addEventListener("dragstart", (event) => {
      card.classList.add("is-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", item.id);
      }
      if (typeof onDragStart === "function") {
        onDragStart(item.id);
      }
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("is-dragging");
      document.querySelectorAll(".portfolio-section").forEach((section) => section.classList.remove("is-drop-target"));
      if (typeof onDragEnd === "function") {
        onDragEnd();
      }
    });

    viewButton.addEventListener("click", () => {
      if (typeof onOpenDetail === "function") {
        onOpenDetail(item.id);
      }
    });

    return fragment;
  }

  function renderPortfolioList(target, items, emptyText, cardOptions) {
    if (!target) return;
    target.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "portfolio-empty";
      empty.textContent = emptyText;
      target.appendChild(empty);
      return;
    }
    items.forEach((item) => {
      target.appendChild(renderPortfolioCard(item, cardOptions));
    });
  }

  function renderPortfolioYearFilter(items, dom, state) {
    if (!dom.portfolioYearFilter) return;
    const portfolioUtils = root.PlanboardPortfolioUtils;
    const years = portfolioUtils && portfolioUtils.yearsForItems ? portfolioUtils.yearsForItems(items) : [];
    if (state.portfolioYear !== "all" && !years.includes(state.portfolioYear)) {
      state.portfolioYear = "all";
    }
    const currentOptions = [...dom.portfolioYearFilter.options].map((option) => option.value).join("|");
    const nextOptions = ["all", ...years].join("|");
    if (currentOptions !== nextOptions) {
      dom.portfolioYearFilter.innerHTML = "";
      const all = document.createElement("option");
      all.value = "all";
      all.textContent = "All years";
      dom.portfolioYearFilter.appendChild(all);
      years.forEach((year) => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        dom.portfolioYearFilter.appendChild(option);
      });
    }
    dom.portfolioYearFilter.value = state.portfolioYear;
  }

  function renderPortfolioDetail(item, dom, utils) {
    const isOpen = Boolean(item);
    if (dom.portfolioDetailOverlay) {
      dom.portfolioDetailOverlay.classList.toggle("task-detail-overlay--hidden", !isOpen);
      dom.portfolioDetailOverlay.setAttribute("aria-hidden", String(!isOpen));
    }
    if (dom.portfolioDetailPanel) {
      dom.portfolioDetailPanel.classList.toggle("task-detail--hidden", !isOpen);
      dom.portfolioDetailPanel.setAttribute("aria-hidden", String(!isOpen));
    }
    if (!item) return;

    if (dom.portfolioDetailType) dom.portfolioDetailType.textContent = portfolioTypeLabel(item.type);
    if (dom.portfolioDetailTitle) dom.portfolioDetailTitle.textContent = item.title || "Portfolio item";
    if (dom.portfolioDetailMeta) dom.portfolioDetailMeta.textContent = item.organization || "Portfolio record";

    const effectiveStatus = portfolioEffectiveStatus(item, utils.todayIso ? utils.todayIso() : "");
    if (dom.portfolioDetailStatus) {
      dom.portfolioDetailStatus.textContent = item.statusMode === "auto"
        ? `${portfolioStatusLabel(effectiveStatus)} (Auto)`
        : portfolioStatusLabel(item.status);
    }
    if (dom.portfolioDetailDates) dom.portfolioDetailDates.textContent = portfolioDateRange(item, utils.shortDateFormatter);
    if (dom.portfolioDetailRole) dom.portfolioDetailRole.textContent = item.role || "-";
    if (dom.portfolioDetailTeammates) dom.portfolioDetailTeammates.textContent = item.teammates || "-";
    if (dom.portfolioDetailCert) dom.portfolioDetailCert.textContent = item.cert ? "Yes" : "No";

    if (dom.portfolioDetailAchievement) dom.portfolioDetailAchievement.textContent = item.achievement || "";
    if (dom.portfolioDetailAchievementBlock) dom.portfolioDetailAchievementBlock.hidden = !item.achievement;

    renderPortfolioLinks(dom.portfolioDetailLinks, item.links);
    if (dom.portfolioDetailLinksBlock) dom.portfolioDetailLinksBlock.hidden = !String(item.links || "").trim();

    if (dom.portfolioDetailNotes) dom.portfolioDetailNotes.textContent = item.notes || "";
    if (dom.portfolioDetailNotesBlock) dom.portfolioDetailNotesBlock.hidden = !item.notes;
  }

  function renderPortfolio(context) {
    const {
      state,
      dom,
      utils,
      onOpenDetail,
      onDragStart,
      onDragEnd,
    } = context;

    const portfolioUtils = root.PlanboardPortfolioUtils;
    const allItems = portfolioUtils && portfolioUtils.sortItems
      ? portfolioUtils.sortItems(state.portfolioItems || [])
      : [...(state.portfolioItems || [])];

    renderPortfolioYearFilter(allItems, dom, state);

    if (dom.portfolioSearchInput && dom.portfolioSearchInput.value !== state.portfolioSearch) {
      dom.portfolioSearchInput.value = state.portfolioSearch;
    }
    if (dom.portfolioCertFilter && dom.portfolioCertFilter.value !== state.portfolioCert) {
      dom.portfolioCertFilter.value = state.portfolioCert;
    }

    const items = portfolioUtils && portfolioUtils.filterItems
      ? portfolioUtils.filterItems(allItems, {
        type: state.portfolioFilter,
        year: state.portfolioYear,
        cert: state.portfolioCert,
        search: state.portfolioSearch,
      })
      : allItems;

    const grouped = portfolioUtils && portfolioUtils.groupByStatus
      ? portfolioUtils.groupByStatus(items)
      : { planned: [], active: [], completed: [] };

    (dom.portfolioFilterButtons || []).forEach((button) => {
      button.classList.toggle("is-active", button.dataset.portfolioFilter === state.portfolioFilter);
    });

    if (state.activeView === "portfolio") {
      if (dom.allTaskCountHeader) dom.allTaskCountHeader.textContent = String(items.length);
      if (dom.completedMeta) {
        dom.completedMeta.textContent = `${grouped.planned.length} planned / ${grouped.active.length} active / ${grouped.completed.length} completed`;
      }
    }

    const cardOptions = { dom, utils, onOpenDetail, onDragStart, onDragEnd };
    renderPortfolioList(dom.portfolioPlannedList, grouped.planned, "Nothing planned yet.", cardOptions);
    renderPortfolioList(dom.portfolioActiveList, grouped.active, "No active portfolio items.", cardOptions);
    renderPortfolioList(dom.portfolioCompletedList, grouped.completed, "No completed portfolio items yet.", cardOptions);
  }

  root.PlanboardPortfolio = {
    portfolioStatusLabel,
    inferPortfolioStatus,
    portfolioEffectiveStatus,
    withPortfolioEffectiveStatus,
    portfolioTypeLabel,
    portfolioDateRange,
    renderPortfolioLinks,
    renderPortfolioCard,
    renderPortfolioList,
    renderPortfolioYearFilter,
    renderPortfolioDetail,
    renderPortfolio,
  };
})(typeof window !== "undefined" ? window : globalThis);
