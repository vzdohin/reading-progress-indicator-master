jQuery(document).ready(function ($) {
  var articlesWrapper = $(".cd-articles");

  if (articlesWrapper.length > 0) {
    // cache jQuery objects
    var windowHeight = $(window).height(),
      articles = articlesWrapper.find("article"),
      aside = $(".cd-read-more"),
      articleSidebarLinks = aside.find("li");
    // initialize variables
    var scrolling = false,
      sidebarAnimation = false,
      resizing = false,
      mq = checkMQ(),
      svgCircleLength = parseInt(
        Math.PI * (articleSidebarLinks.eq(0).find("circle").attr("r") * 2)
      );

    // check media query and bind corresponding events
    if (mq == "desktop") {
      $(window).on("scroll", checkRead);
      $(window).on("scroll", checkSidebar);
    }

    $(window).on("resize", resetScroll);

    updateArticle();
    updateSidebarPosition();

    aside.on("click", "a", function (event) {
      event.preventDefault();
      var selectedArticle = articles.eq($(this).parent("li").index()),
        selectedArticleTop = selectedArticle.offset().top;

      $(window).off("scroll", checkRead);

      $("body,html").animate(
        { scrollTop: selectedArticleTop + 2 },
        300,
        function () {
          checkRead();
          $(window).on("scroll", checkRead);
        }
      );
    });
  }

  function checkRead() {
    if (!scrolling) {
      scrolling = true;
      !window.requestAnimationFrame
        ? setTimeout(updateArticle, 300)
        : window.requestAnimationFrame(updateArticle);
    }
  }

  function checkSidebar() {
    if (!sidebarAnimation) {
      sidebarAnimation = true;
      !window.requestAnimationFrame
        ? setTimeout(updateSidebarPosition, 300)
        : window.requestAnimationFrame(updateSidebarPosition);
    }
  }

  function resetScroll() {
    if (!resizing) {
      resizing = true;
      !window.requestAnimationFrame
        ? setTimeout(updateParams, 300)
        : window.requestAnimationFrame(updateParams);
    }
  }

  function updateParams() {
    windowHeight = $(window).height();
    mq = checkMQ();
    $(window).off("scroll", checkRead);
    $(window).off("scroll", checkSidebar);

    if (mq == "desktop") {
      $(window).on("scroll", checkRead);
      $(window).on("scroll", checkSidebar);
    }
    resizing = false;
  }

  function updateArticle() {
    var scrollTop = $(window).scrollTop();

    articles.each(function () {
      var article = $(this),
        articleTop = article.offset().top,
        articleHeight = article.outerHeight(),
        articleSidebarLink = articleSidebarLinks
          .eq(article.index())
          .children("a");

      if (article.is(":last-of-type"))
        articleHeight = articleHeight - windowHeight;

      if (articleTop > scrollTop) {
        articleSidebarLink.removeClass("read reading");
      } else if (
        scrollTop >= articleTop &&
        articleTop + articleHeight > scrollTop
      ) {
        var dashoffsetValue =
          svgCircleLength * (1 - (scrollTop - articleTop) / articleHeight);
        articleSidebarLink
          .addClass("reading")
          .removeClass("read")
          .find("circle")
          .attr({ "stroke-dashoffset": dashoffsetValue });
        changeUrl(articleSidebarLink.attr("href"));
      } else {
        articleSidebarLink.removeClass("reading").addClass("read");
      }
    });
    scrolling = false;
  }

  function updateSidebarPosition() {
    var articlesWrapperTop = articlesWrapper.offset().top,
      articlesWrapperHeight = articlesWrapper.outerHeight(),
      scrollTop = $(window).scrollTop();

    if (scrollTop < articlesWrapperTop) {
      aside.removeClass("fixed").attr("style", "");
    } else if (
      scrollTop >= articlesWrapperTop &&
      scrollTop < articlesWrapperTop + articlesWrapperHeight - windowHeight
    ) {
      aside.addClass("fixed").attr("style", "");
    } else {
      var articlePaddingTop = Number(
        articles.eq(1).css("padding-top").replace("px", "")
      );
      if (aside.hasClass("fixed"))
        aside
          .removeClass("fixed")
          .css(
            "top",
            articlesWrapperHeight + articlePaddingTop - windowHeight + "px"
          );
    }
    sidebarAnimation = false;
  }

  function changeUrl(link) {
    var pageArray = location.pathname.split("/"),
      actualPage = pageArray[pageArray.length - 1];
    if (actualPage == link && history.pushState)
      window.history.pushState({ path: link }, "", link);
  }

  function checkMQ() {
    return window
      .getComputedStyle(articlesWrapper.get(0), "::before")
      .getPropertyValue("content")
      .replace(/'/g, "")
      .replace(/"/g, "");
  }
});

// progressBar
// utility functions
if (!Util) function Util() {}

Util.addClass = function (el, className) {
  var classList = className.split(" ");
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(" "));
};

Util.removeClass = function (el, className) {
  var classList = className.split(" ");
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(" "));
};

Util.toggleClass = function (el, className, bool) {
  if (bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _1_reading-progressbar
// Usage: codyhouse.co/license
(function () {
  var readingIndicator = document.getElementsByClassName(
      "js-reading-progressbar"
    )[0],
    readingIndicatorContent =
      document.getElementsByClassName("js-reading-content")[0];

  if (readingIndicator && readingIndicatorContent) {
    var progressInfo = [],
      progressEvent = false,
      progressFallback = readingIndicator.getElementsByClassName(
        "js-reading-progressbar__fallback"
      )[0],
      progressIsSupported = "value" in readingIndicator;

    var boundingClientRect = readingIndicatorContent.getBoundingClientRect();

    progressInfo["height"] = readingIndicatorContent.offsetHeight;
    progressInfo["top"] = boundingClientRect.top;
    progressInfo["bottom"] = boundingClientRect.bottom;
    progressInfo["window"] = window.innerHeight;
    progressInfo["class"] = "reading-progressbar--is-active";
    progressInfo["hideClass"] = "reading-progressbar--is-out";

    //init indicator
    setProgressIndicator();
    // wait for font to be loaded - reset progress bar
    if (document.fonts) {
      document.fonts.ready.then(function () {
        triggerReset();
      });
    }
    // listen to window resize - update progress
    window.addEventListener("resize", function (event) {
      triggerReset();
    });

    //listen to the window scroll event - update progress
    window.addEventListener("scroll", function (event) {
      if (progressEvent) return;
      progressEvent = true;
      !window.requestAnimationFrame
        ? setTimeout(function () {
            setProgressIndicator();
          }, 250)
        : window.requestAnimationFrame(setProgressIndicator);
    });

    function setProgressIndicator() {
      var boundingClientRect = readingIndicatorContent.getBoundingClientRect();
      progressInfo["top"] = boundingClientRect.top;
      progressInfo["bottom"] = boundingClientRect.bottom;

      if (progressInfo["height"] <= progressInfo["window"]) {
        // short content - hide progress indicator
        Util.removeClass(readingIndicator, progressInfo["class"]);
        progressEvent = false;
        return;
      }
      // get new progress and update element
      Util.addClass(readingIndicator, progressInfo["class"]);
      var value =
        progressInfo["top"] >= 0
          ? 0
          : (100 * (0 - progressInfo["top"])) /
            (progressInfo["height"] - progressInfo["window"]);
      readingIndicator.setAttribute("value", value);
      if (!progressIsSupported && progressFallback)
        progressFallback.style.width = value + "%";
      // hide progress bar when target is outside the viewport
      Util.toggleClass(
        readingIndicator,
        progressInfo["hideClass"],
        progressInfo["bottom"] <= 0
      );
      progressEvent = false;
    }

    function triggerReset() {
      if (progressEvent) return;
      progressEvent = true;
      !window.requestAnimationFrame
        ? setTimeout(function () {
            resetProgressIndicator();
          }, 250)
        : window.requestAnimationFrame(resetProgressIndicator);
    }

    function resetProgressIndicator() {
      progressInfo["height"] = readingIndicatorContent.offsetHeight;
      progressInfo["window"] = window.innerHeight;
      setProgressIndicator();
    }
  }
})();
