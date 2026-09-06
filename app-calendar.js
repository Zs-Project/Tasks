(function (root) {
  function calendarMonthDates(year, month, weekStartFn) {
    const first = new Date(year, month, 1);
    const start = typeof weekStartFn === "function" ? weekStartFn(first) : new Date(first);
    const dates = [];
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      dates.push(date);
    }
    return dates;
  }

  function renderCalendar(context) {
    const {
      state,
      dom,
      utils,
      onSelectDate,
      onOpenTaskDetail,
    } = context;

    const selected = new Date(`${state.selectedDate}T00:00:00`);
    const month = selected.getMonth();
    const year = selected.getFullYear();
    const deadlineMap = utils.deadlineTodosByDate();

    if (dom.calendarMonthSelect) dom.calendarMonthSelect.value = String(month);
    if (dom.calendarYearLabel) dom.calendarYearLabel.textContent = String(year);
    if (dom.calendarMonthHeading) {
      dom.calendarMonthHeading.textContent = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(selected);
    }

    if (!dom.calendarGrid) return;
    dom.calendarGrid.innerHTML = "";

    const dates = calendarMonthDates(year, month, utils.weekStart);
    dates.forEach((date) => {
      const iso = utils.dateToLocalIso(date);
      const todos = deadlineMap.get(iso) || [];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-day";
      button.classList.toggle("is-muted", date.getMonth() !== month);
      button.classList.toggle("is-today", iso === utils.todayIso());
      button.classList.toggle("is-selected", iso === state.selectedDate);

      const number = document.createElement("span");
      number.className = "calendar-day__number";
      number.textContent = String(date.getDate());
      button.appendChild(number);

      const count = document.createElement("span");
      count.className = "calendar-day__count";
      count.textContent = todos.length ? `${todos.length} task${todos.length === 1 ? "" : "s"}` : "";
      button.appendChild(count);

      if (todos.length) {
        const priorityCounts = utils.calendarPriorityCounts
          ? utils.calendarPriorityCounts(todos)
          : { high: 0, medium: 0, low: 0 };
        const prioritySummary = document.createElement("div");
        prioritySummary.className = "calendar-day__priorities";
        [
          ["high", "H"],
          ["medium", "M"],
          ["low", "L"],
        ].forEach(([priority, label]) => {
          if (!priorityCounts[priority]) return;
          const item = document.createElement("span");
          item.className = `calendar-day__priority calendar-day__priority--${priority}`;
          item.textContent = `${label} ${priorityCounts[priority]}`;
          prioritySummary.appendChild(item);
        });
        button.appendChild(prioritySummary);
      }

      button.addEventListener("click", () => {
        if (typeof onSelectDate === "function") {
          onSelectDate(iso);
        }
      });
      dom.calendarGrid.appendChild(button);
    });

    renderCalendarTimeline({
      selectedDate: state.selectedDate,
      todos: deadlineMap.get(state.selectedDate) || [],
      dom,
      utils,
      onOpenTaskDetail,
    });
  }

  function renderCalendarTimeline({ selectedDate, todos, dom, utils, onOpenTaskDetail }) {
    if (!dom.calendarTimelineList) return;
    if (dom.calendarSelectedDateLabel) {
      dom.calendarSelectedDateLabel.textContent = utils.dayFormatter.format(new Date(`${selectedDate}T00:00:00`));
    }
    if (dom.calendarSelectedDateMeta) {
      dom.calendarSelectedDateMeta.textContent = `${todos.length} deadline${todos.length === 1 ? "" : "s"}`;
    }
    dom.calendarTimelineList.innerHTML = "";

    if (!todos.length) {
      const empty = document.createElement("div");
      empty.className = "deadline-empty";
      empty.textContent = "No dated deadlines for this day.";
      dom.calendarTimelineList.appendChild(empty);
      return;
    }

    const sorted = utils.sortDeadlineTodos ? utils.sortDeadlineTodos(todos) : [...todos];
    sorted.forEach((todo) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `deadline-item priority-${todo.priority || "medium"}`;
      button.classList.toggle("is-done", Boolean(todo.done));

      const priority = document.createElement("span");
      priority.className = "deadline-item__priority";
      priority.textContent = todo.priority || "medium";

      const title = document.createElement("strong");
      title.textContent = todo.title || "Untitled task";

      const details = document.createElement("span");
      const lane = utils.groupingLane ? utils.groupingLane(todo) : todo.lane;
      details.textContent = todo.details || (utils.laneLabel ? utils.laneLabel(lane) : lane || "");

      button.append(priority, title, details);
      button.addEventListener("click", () => {
        if (typeof onOpenTaskDetail === "function") {
          onOpenTaskDetail(todo.id);
        }
      });
      dom.calendarTimelineList.appendChild(button);
    });
  }

  function renderPlans({ plans, dom, onOpenPlanEditor, onDeletePlan }) {
    if (!dom.planList || !dom.planItemTemplate) return;
    dom.planList.innerHTML = "";
    if (!plans.length) {
      const empty = document.createElement("li");
      empty.className = "lane-empty";
      empty.textContent = "No plans for this day yet.";
      dom.planList.appendChild(empty);
      return;
    }

    plans.forEach((plan) => {
      const fragment = dom.planItemTemplate.content.cloneNode(true);
      fragment.querySelector(".plan-item__time").textContent = plan.timeLabel || "Any time";
      fragment.querySelector(".plan-item__title").textContent = plan.title;
      fragment.querySelector(".plan-item__details").textContent = plan.details || "";
      fragment.querySelector(".plan-item__edit").addEventListener("click", () => {
        if (typeof onOpenPlanEditor === "function") {
          onOpenPlanEditor(plan);
        }
      });
      fragment.querySelector(".plan-item__delete").addEventListener("click", () => {
        if (typeof onDeletePlan === "function") {
          onDeletePlan(plan.id);
        }
      });
      dom.planList.appendChild(fragment);
    });
  }

  root.PlanboardCalendar = {
    calendarMonthDates,
    renderCalendar,
    renderCalendarTimeline,
    renderPlans,
  };
})(typeof window !== "undefined" ? window : globalThis);
