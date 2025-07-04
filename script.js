/**
 * 功德辦理系統展示網站互動腳本
 */

// DOM 載入完成後執行
document.addEventListener("DOMContentLoaded", function () {
  // 初始化導航欄互動
  initNavbar();

  // 初始化滾動動畫
  initScrollAnimations();

  // 初始化功能卡片互動
  initFeatureCards();

  // 初始化頁面特定功能
  initPageSpecific();
});

/**
 * 初始化導航欄互動效果
 */
function initNavbar() {
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  // 響應式菜單切換
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // 點擊導航鏈接後關閉菜單（在移動設備上）
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        navToggle.classList.remove("active");
        navMenu.classList.remove("active");
      }
    });
  });

  // 滾動時改變導航欄樣式
  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 50) {
      navbar.style.boxShadow = "var(--shadow-md)";
      navbar.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
    } else {
      navbar.style.boxShadow = "var(--shadow-sm)";
      navbar.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
    }
  });

  // 設置當前頁面的導航鏈接為活動狀態
  highlightCurrentPageNavLink();
}

/**
 * 高亮顯示當前頁面的導航鏈接
 */
function highlightCurrentPageNavLink() {
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    // 移除所有活動狀態
    link.classList.remove("active");

    // 根據當前頁面設置活動狀態
    if (currentPage === "") {
      // 首頁
      if (link.getAttribute("href") === "#home") {
        link.classList.add("active");
      }
    } else if (link.getAttribute("href").includes(currentPage)) {
      link.classList.add("active");
    }
  });
}

/**
 * 初始化滾動動畫效果
 */
function initScrollAnimations() {
  // 滾動顯示元素
  const animatedElements = document.querySelectorAll(
    ".features-grid, .highlights-grid, .tech-grid, .cta-content, .showcase-grid, .architecture-diagram, .pricing-table"
  );

  // 檢查元素是否在視窗中可見
  function checkScroll() {
    animatedElements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (elementPosition < windowHeight * 0.85) {
        element.classList.add("animate-fade-in");
      }
    });
  }

  // 初始檢查
  checkScroll();

  // 滾動時檢查
  window.addEventListener("scroll", checkScroll);
}

/**
 * 初始化功能卡片互動
 */
function initFeatureCards() {
  const featureCards = document.querySelectorAll(
    ".feature-card, .tech-card, .highlight-item"
  );

  featureCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px)";
      this.style.boxShadow = "var(--shadow-lg)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "";
      this.style.boxShadow = "var(--shadow-md)";
    });
  });
}

/**
 * 初始化頁面特定功能
 */
function initPageSpecific() {
  const currentPage = window.location.pathname.split("/").pop();

  // 功能展示頁面
  if (currentPage === "features.html") {
    initFeatureShowcase();
  }

  // 系統架構頁面
  if (currentPage === "architecture.html") {
    initArchitectureDiagrams();
  }

  // 專案報價頁面
  if (currentPage === "pricing.html") {
    initPricingCalculator();
  }
}

/**
 * 初始化功能展示頁面的特定功能
 */
function initFeatureShowcase() {
  // 功能模組選項卡切換
  const moduleButtons = document.querySelectorAll(".module-button");
  const moduleContents = document.querySelectorAll(".module-content");

  if (moduleButtons.length) {
    moduleButtons.forEach((button, index) => {
      button.addEventListener("click", function () {
        // 隱藏所有內容
        moduleContents.forEach((content) => {
          content.style.display = "none";
        });

        // 移除所有按鈕活動狀態
        moduleButtons.forEach((btn) => {
          btn.classList.remove("active");
        });

        // 顯示選中的內容
        moduleContents[index].style.display = "block";

        // 設置按鈕活動狀態
        this.classList.add("active");
      });
    });

    // 預設顯示第一個選項卡
    if (moduleButtons.length > 0 && moduleContents.length > 0) {
      moduleButtons[0].classList.add("active");
      moduleContents[0].style.display = "block";
    }
  }

  // 功能演示動畫
  const demoCircles = document.querySelectorAll(".demo-circle");

  demoCircles.forEach((circle) => {
    circle.addEventListener("click", function () {
      // 添加點擊動畫
      this.classList.add("animate-pulse");

      // 動畫結束後移除
      setTimeout(() => {
        this.classList.remove("animate-pulse");
      }, 2000);
    });
  });
}

/**
 * 初始化系統架構頁面的特定功能
 */
function initArchitectureDiagrams() {
  // 架構層級說明顯示
  const layerElements = document.querySelectorAll(".architecture-layer");
  const layerDetails = document.querySelectorAll(".layer-detail");

  if (layerElements.length) {
    layerElements.forEach((layer, index) => {
      layer.addEventListener("mouseenter", function () {
        if (layerDetails[index]) {
          layerDetails[index].style.display = "block";
        }
      });

      layer.addEventListener("mouseleave", function () {
        if (layerDetails[index]) {
          layerDetails[index].style.display = "none";
        }
      });
    });
  }
}

/**
 * 初始化專案報價頁面的特定功能
 */
function initPricingCalculator() {
  const moduleCheckboxes = document.querySelectorAll(".module-checkbox");
  const totalPriceElement = document.getElementById("total-price");
  const basePriceElement = document.getElementById("base-price");

  if (moduleCheckboxes.length && totalPriceElement && basePriceElement) {
    // 基本價格
    const basePrice =
      parseInt(basePriceElement.getAttribute("data-price")) || 0;
    let totalPrice = basePrice;

    moduleCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const modulePrice = parseInt(this.getAttribute("data-price")) || 0;

        if (this.checked) {
          totalPrice += modulePrice;
        } else {
          totalPrice -= modulePrice;
        }

        // 更新顯示的總價
        if (totalPriceElement) {
          totalPriceElement.textContent = new Intl.NumberFormat("zh-TW").format(
            totalPrice
          );
        }
      });
    });
  }
}

/**
 * 平滑滾動到頁面錨點
 */
document.querySelectorAll("a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // 只處理以 # 開頭且不是單純 # 的錨點連結
    if (href && href.startsWith("#") && href !== "#") {
      e.preventDefault();

      const targetElement = document.querySelector(href);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // 減去導航欄高度
          behavior: "smooth",
        });
      }
    }
    // 其他連結（如 features.html）將正常導航
  });
});

/**
 * 添加視差滾動效果
 */
window.addEventListener("scroll", function () {
  const scrollY = window.scrollY;

  // 英雄區塊視差效果
  const heroSection = document.querySelector(".hero-section");
  if (heroSection) {
    heroSection.style.backgroundPositionY = scrollY * 0.5 + "px";
  }

  // 旋轉軌道加速效果
  const orbits = document.querySelectorAll(".orbit-circle");
  orbits.forEach((orbit, index) => {
    const rotationSpeed = 0.02 * (index + 1);
    orbit.style.transform = `translate(-50%, -50%) rotate(${
      scrollY * rotationSpeed
    }deg)`;
  });
});

/**
 * 添加載入動畫
 */
window.addEventListener("load", function () {
  // 頁面載入完成後顯示內容
  document.body.classList.add("loaded");

  // 添加元素的進入動畫
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    heroContent.classList.add("animate-fade-in");
  }
});
