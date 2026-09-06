(function (root) {
  const TOKEN_KEY = "planboard-token";
  const UI_KEY = "planboard-ui";
  const NOTIFICATION_KEY = "planboard-notified";
  const DEFAULT_THEME_KEY = "planboard-default-theme";
  const DEFAULT_THEME = "aurora";
  const THEMES = ["aurora", "light"];

  function todayIso() {
    const utils = root.PlannerUtils;
    return utils && utils.todayIso ? utils.todayIso() : new Date().toISOString().slice(0, 10);
  }

  function normalizeIsoDateInput(value) {
    const utils = root.PlannerUtils;
    return utils && utils.normalizeIsoDateInput ? utils.normalizeIsoDateInput(value) : String(value || "");
  }

  function loadUiState() {
    const defaults = {
      selectedDate: todayIso(),
      activeView: "board",
      portfolioFilter: "all",
      portfolioYear: "all",
      portfolioCert: "all",
      portfolioSearch: "",
      filterMode: "all",
      mobileView: "daily",
      sortMode: "manual",
      theme: localStorage.getItem(DEFAULT_THEME_KEY) || DEFAULT_THEME,
      sidebarCollapsed: false,
    };
    try {
      const parsed = JSON.parse(localStorage.getItem(UI_KEY) || "null");
      const activeView = parsed && ["board", "calendar", "portfolio"].includes(parsed.activeView) ? parsed.activeView : "board";
      const portfolioFilter = parsed && ["all", "project", "competition", "course"].includes(parsed.portfolioFilter)
        ? parsed.portfolioFilter
        : "all";
      const portfolioCert = parsed && ["all", "cert", "no-cert"].includes(parsed.portfolioCert)
        ? parsed.portfolioCert
        : "all";
      const mobileView = parsed && ["daily", "ideas", "month", "done", "boardtools", "filtered"].includes(parsed.mobileView)
        ? parsed.mobileView
        : "daily";
      return {
        ...defaults,
        ...(parsed || {}),
        activeView,
        portfolioFilter,
        portfolioYear: String((parsed && parsed.portfolioYear) || "all"),
        portfolioCert,
        portfolioSearch: String((parsed && parsed.portfolioSearch) || ""),
        mobileView,
        sidebarCollapsed: Boolean(parsed && parsed.sidebarCollapsed),
        selectedDate: normalizeIsoDateInput(parsed && parsed.selectedDate) || defaults.selectedDate,
        theme: THEMES.includes(defaults.theme) ? defaults.theme : DEFAULT_THEME,
      };
    } catch {
      return defaults;
    }
  }

  function saveUiState(state) {
    if (!state) return;
    localStorage.setItem(
      UI_KEY,
      JSON.stringify({
        selectedDate: state.selectedDate,
        activeView: state.activeView,
        portfolioFilter: state.portfolioFilter,
        portfolioYear: state.portfolioYear,
        portfolioCert: state.portfolioCert,
        portfolioSearch: state.portfolioSearch,
        filterMode: state.filterMode,
        mobileView: state.mobileView,
        sortMode: state.sortMode,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      })
    );
  }

  function loadNotifiedState() {
    try {
      return JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveNotifiedState(notified) {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify((notified || []).slice(-200)));
  }

  function createState() {
    const initialUi = loadUiState();
    return {
      token: localStorage.getItem(TOKEN_KEY) || "",
      user: null,
      activeAuthMode: "login",
      activeComposerTab: "task",
      selectedDate: initialUi.selectedDate,
      filterMode: initialUi.filterMode,
      activeView: initialUi.activeView,
      portfolioFilter: initialUi.portfolioFilter,
      portfolioYear: initialUi.portfolioYear,
      portfolioCert: initialUi.portfolioCert,
      portfolioSearch: initialUi.portfolioSearch,
      mobileView: initialUi.mobileView,
      sortMode: initialUi.sortMode,
      theme: initialUi.theme,
      sidebarCollapsed: initialUi.sidebarCollapsed,
      notesByDate: {},
      plans: [],
      portfolioItems: [],
      todos: [],
      syncing: false,
      editingTaskId: "",
      editingPlanId: "",
      notified: loadNotifiedState(),
      detailTaskId: "",
      detailDraft: null,
      detailDirty: false,
      detailSaving: false,
      detailCompletedCollapsed: true,
      taskActionTaskId: "",
      portfolioDetailItemId: "",
      lastSyncedAt: 0,
      undoAction: null,
    };
  }

  root.PlanboardState = {
    TOKEN_KEY,
    UI_KEY,
    NOTIFICATION_KEY,
    DEFAULT_THEME_KEY,
    DEFAULT_THEME,
    THEMES,
    loadUiState,
    saveUiState,
    loadNotifiedState,
    saveNotifiedState,
    createState,
  };
})(typeof window !== "undefined" ? window : globalThis);
