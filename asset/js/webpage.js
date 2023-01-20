jQuery(function () {
  // THEME TOGGLE

  // load saved theme state
  if (localStorage.getItem("theme_toggle") != null) {
    setThemeToggle(localStorage.getItem("theme_toggle") == "true");
  }

  var lastScheme = "theme-dark";
  // change theme to match current system theme
  if (
    localStorage.getItem("theme_toggle") == null &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    setThemeToggle(true);
    lastScheme = "theme-light";
  }
  if (
    localStorage.getItem("theme_toggle") == null &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    setThemeToggle(true);
    lastScheme = "theme-dark";
  }
//mobileservice.
if (navigator.userAgent.match(/mobile/i)) {
	if ($("body").hasClass("is-mobile")) {
        $("body").removeClass("is-mobile");
      }else
	  {
		$("body").addClass("is-mobile");
	  }
}else
{
    if ($("body").hasClass("is-mobile")) {
        $("body").removeClass("is-mobile");
      }
}
  // set initial toggle state based on body theme class
  if ($("body").hasClass("theme-light")) {
    setThemeToggle(true);
  } else {
    setThemeToggle(false);
  }

  function setThemeToggle(state, instant = false) {
    $(".toggle__input").each(function () {
      $(this).prop("checked", state);
    });

    if (!$(".toggle__input").hasClass("is-checked") && state) {
      $(".toggle__input").addClass("is-checked");
    } else if ($(".toggle__input").hasClass("is-checked") && !state) {
      $(".toggle__input").removeClass("is-checked");
    }

    if (!state) {
      if ($("body").hasClass("theme-light")) {
        $("body").removeClass("theme-light");
      }

      if (!$("body").hasClass("theme-dark")) {
        $("body").addClass("theme-dark");
      }
    } else {
      if ($("body").hasClass("theme-dark")) {
        $("body").removeClass("theme-dark");
      }

      if (!$("body").hasClass("theme-light")) {
        $("body").addClass("theme-light");
      }
    }

    localStorage.setItem("theme_toggle", state ? "true" : "false");
  }

  $(".toggle__input").on("click", function () {
    setThemeToggle(!(localStorage.getItem("theme_toggle") == "true"));
  });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      // return if we are printing
      if (window.matchMedia("print").matches) {
        printing = true;
        return;
      }

      let newColorScheme = event.matches ? "theme-dark" : "theme-light";

      if (newColorScheme == lastScheme) return;

      if (newColorScheme == "theme-dark") {
        setThemeToggle(false);
        console.log("dark");
      }

      if (newColorScheme == "theme-light") {
        setThemeToggle(true);
      }

      lastScheme = newColorScheme;
    });

  // MAKE CALLOUTS COLLAPSIBLE
  // if the callout title is clicked, toggle the display of .callout-content
  $(".callout.is-collapsible .callout-title").on("click", function () {
    var isCollapsed = $(this).parent().hasClass("is-collapsed");

    if (isCollapsed) {
      $(this).parent().toggleClass("is-collapsed");
    }

    $(this)
      .parent()
      .find(".callout-content")
      .slideToggle(
        (duration = 100),
        (complete = function () {
          if (!isCollapsed) {
            $(this).parent().toggleClass("is-collapsed");
          }
        })
      );
  });

  // MAKE HEADERS COLLAPSIBLE
  // if "heading-collapse-indicator" is clicked, toggle the display of every div until the next heading of the same or lower level

  function getHeadingContentsSelector(header) {
    let headingLevel = $(header)
      .children()
      .first()
      .prop("tagName")
      .toLowerCase();
    let headingNumber = parseInt(headingLevel.replace("h", ""));

    let endingHeadings = [1, 2, 3, 4, 5, 6]
      .filter(function (item) {
        return item <= headingNumber;
      })
      .map(function (item) {
        return `div:has(h${item})`;
      });

    let endingHeadingsSelector = endingHeadings.join(", ");

    return endingHeadingsSelector;
  }

  function setHeaderCollapse(header, collapse) {
    let selector = getHeadingContentsSelector($(header));

    if (!collapse) {
      if ($(header).hasClass("is-collapsed"))
        $(header).toggleClass("is-collapsed");

      $(header).nextUntil(selector).show();

      // close headers inside of this one that are collapsed
      $(header)
        .nextUntil(selector)
        .each(function () {
          if ($(this).hasClass("is-collapsed"))
            setHeaderCollapse($(this), true);
        });

      //open headers above this one that are collapsed
      lastHeaderSize = $(header)
        .children()
        .first()
        .prop("tagName")
        .toLowerCase()
        .replace("h", "");
      $(header)
        .prevAll()
        .each(function () {
          if (
            $(this).hasClass("is-collapsed") &&
            $(this).has("h1, h2, h3, h4, h5, h6")
          ) {
            let hSize = $(this)
              .children()
              .first()
              .prop("tagName")
              .toLowerCase()
              .replace("h", "");
            console.log(hSize + " <? " + lastHeaderSize);
            if (hSize < lastHeaderSize) {
              setHeaderCollapse($(this), false);
              lastHeaderSize = hSize;
            }
          }
        });
    } else {
      if (!$(header).hasClass("is-collapsed"))
        $(header).toggleClass("is-collapsed");
      $(header).nextUntil(selector).hide();
    }
  }

  $(".heading-collapse-indicator").on("click", function () {
    var isCollapsed = $(this).parent().parent().hasClass("is-collapsed");
    setHeaderCollapse($(this).parent().parent(), !isCollapsed);
  });

  // open outline header when an internal link that points to that header is clicked
  $(".internal-link").on("click", function () {
    let target = $(this).attr("href");

    if (target.startsWith("#")) {
      let header = $(target);

      setHeaderCollapse($(header).parent(), false);
    }
  });

  // Make button with id="#save-to-pdf" save the current page to a PDF file
  $("#save-pdf").on("click", function () {
    window.print();
  });

  // MAKE OUTLINE COLLAPSIBLE
  // if "outline-header" is clicked, toggle the display of every div until the next heading of the same or lower level

  var outline_width = 0;

  $(".outline-item-contents > .collapse-icon").on("click", function () {
    var isCollapsed = $(this).parent().parent().hasClass("is-collapsed");

    $(this).parent().parent().toggleClass("is-collapsed");

    if (isCollapsed) {
      $(this).parent().next().slideDown(120);
    } else {
      $(this).parent().next().slideUp(120);
    }
  });

  // hide the control button if the header has no children
  $(".outline-item-children:not(:has(*))").each(function () {
    $(this).parent().find(".collapse-icon").hide();
  });

  // Fix checkboxed toggling .is-checked
  $(".task-list-item-checkbox").on("click", function () {
    $(this).parent().toggleClass("is-checked");
    $(this)
      .parent()
      .attr("data-task", $(this).parent().hasClass("is-checked") ? "x" : " ");
  });

  $(`input[type="checkbox"]`).each(function () {
    $(this).prop("checked", $(this).hasClass("is-checked"));
  });

  $(".kanban-plugin__item.is-complete").each(function () {
    $(this).find('input[type="checkbox"]').prop("checked", true);
  });

  // make code snippet block copy button copy the code to the clipboard
  $(".copy-code-button").on("click", function () {
    let code = $(this).parent().find("code").text();
    navigator.clipboard.writeText(code);
  });

  let focusedNode = null;

  // make canvas nodes selectable
  $(".canvas-node-content-blocker").on("click", function () {
    console.log("clicked");
    $(this).parent().parent().toggleClass("is-focused");
    $(this).hide();

    if (focusedNode) {
      focusedNode.removeClass("is-focused");
      $(focusedNode).find(".canvas-node-content-blocker").show();
    }

    focusedNode = $(this).parent().parent();
  });

  // make canvas node deselect when clicking outside
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".canvas-node").length) {
      $(".canvas-node").removeClass("is-focused");
      $(".canvas-node-content-blocker").show();
    }
  });

  // unhide html elements that are hidden by default
  // $("html").css("visibility", "visible");
  // $("html").css("background-color", "var(--background-primary)");

  startTime();
  function startTime() {
    var today = new Date();
    var y = today.getFullYear();
    var M = today.getMonth() + 1;
    var d = today.getDate();
    var w = today.getDay();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var week = [
      "星期天",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ];
    var month = [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ];
    // add a zero in front of numbers<10
    h = checkTime(h);
    M = checkTime(M);
    d = checkTime(d);
    m = checkTime(m);
    s = checkTime(s);
    var str =
      y +
      "年" +
      M +
      "月" +
      d +
      "日" +
      " " +
      h +
      "时" +
      m +
      "分" +
      s +
      "秒" +
      " " +
      week[w];
    var DigitalClock = `<div class="DPDC" cityid="9701" lang="en" id="DigitalClock" ampm="false" nightsign="true" sun="false"><div class="DPDCt"><span class="DPDCth">${h}</span><span class="DPDCtm">${m}</span><span class="DPDCts">${s}</span></div><div class="DPDCd"><span class="DPDCdt">${M}月${d}  ${week[w]}</span></div></div>`;
    $("#Digital-Clock").html(DigitalClock);
    $("#home_date").html(str);
    $("#day").html(d);
    $("#weekday").html(week[w]);
    $("#month").html(month[M - 1]);

    t = setTimeout(startTime, 1000);
    function checkTime(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }
  }

  $.get(
    "/Blue-topaz-example-online/asset/html/navigator.html",
    function (data) {
      $("#sidebar.sidebar-left").append(data);
	  	// auto hide file explorer
    }
  );

  $.get(
    "/Blue-topaz-example-online/asset/html/file_explore.html",
    function (data) {
      $("#sidebar.sidebar-left").append(data);

      $(".nav-files-container .nav-folder-title").on("click", function () {
        var isCollapsed = $(this).parent().hasClass("is-collapsed");

        if (isCollapsed) {
          $(this).parent().toggleClass("is-collapsed");
        }

        $(this)
          .parent()
          .find(".nav-folder-children")
          .slideToggle(
            (duration = 100),
            (complete = function () {
              if (!isCollapsed) {
                $(this).parent().toggleClass("is-collapsed");
              }
            })
          );
      });
      $(".nav-folder-children .nav-file-title").on("click", function () {
        var path = $(this).data("path");
        let fileName = path.substring(0, path.lastIndexOf("."));
        window.location.href =
          "/Blue-topaz-example-online/" + fileName + ".html";
      });
    }
  );
  
  var outline=`<button id="bullet-list" class="blank main-bar  button-inline"><svg viewBox="0 0 100 100"   width="18" height="18" style="right: 30px;"><path fill="var(--h6-color)" stroke="var(--h6-color)" d="M16.4,16.4c-3.5,0-6.4,2.9-6.4,6.4s2.9,6.4,6.4,6.4s6.4-2.9,6.4-6.4S19.9,16.4,16.4,16.4z M16.4,19.6 c1.8,0,3.2,1.4,3.2,3.2c0,1.8-1.4,3.2-3.2,3.2s-3.2-1.4-3.2-3.2C13.2,21,14.6,19.6,16.4,19.6z M29.2,21.2v3.2H90v-3.2H29.2z M16.4,43.6c-3.5,0-6.4,2.9-6.4,6.4s2.9,6.4,6.4,6.4s6.4-2.9,6.4-6.4S19.9,43.6,16.4,43.6z M16.4,46.8c1.8,0,3.2,1.4,3.2,3.2 s-1.4,3.2-3.2,3.2s-3.2-1.4-3.2-3.2S14.6,46.8,16.4,46.8z M29.2,48.4v3.2H90v-3.2H29.2z M16.4,70.8c-3.5,0-6.4,2.9-6.4,6.4 c0,3.5,2.9,6.4,6.4,6.4s6.4-2.9,6.4-6.4C22.8,73.7,19.9,70.8,16.4,70.8z M16.4,74c1.8,0,3.2,1.4,3.2,3.2c0,1.8-1.4,3.2-3.2,3.2 s-3.2-1.4-3.2-3.2C13.2,75.4,14.6,74,16.4,74z M29.2,75.6v3.2H90v-3.2H29.2z"></path></svg></button>`
  $("#sidebar.sidebar-right").before(outline);

 // right sidebar
 $("#bullet-list").on("click", function () {
	$marginlefty= $('#sidebar .outline-container');
	$marginlefty.animate({ 
		width:parseInt($marginlefty.css('width'),10)==0 ?  360:0 
		}); 
    if ($("body").hasClass("is-mobile")) 
      {
        $("#bullet-list").animate({ 
          right:30 
          }); 
      }else
      {
        $("#bullet-list").animate({ 
          right:parseInt(	$("#bullet-list").css('right'),10)==40 ?  360:40 
          }); 
      }

  });


  // moc
  $(".markdown-reading-view button.main-bar").each(function (index) {
    $(this)
      .eq(0)
      .on("click", function () {
        window.location.href = "/Blue-topaz-example-online/";
      });
    $(this)
      .eq(1)
      .on("click", function () {
        window.history.back(-1);
      });
    $(this)
      .eq(2)
      .on("click", function () {
        window.history.forward();
      });
    $(this)
      .eq(3)
      .on("click", function () {
        window.location.reload();
      });
  });

  $("body .markdown-reading-view").on("touchstart", function(e) {
    // 判断默认行为是否可以被禁用
    if (e.cancelable) {
        // 判断默认行为是否已经被禁用
        if (!e.defaultPrevented) {
            e.preventDefault();
        }
    }   
    if($('#sidebar .outline-container').css('width')) { //
      $('#sidebar .outline-container').animate({ 
        width:0 
        });     
         
    if ($("body").hasClass("is-mobile")) 
    {
      $("#bullet-list").animate({ 
        right:30 
        }); 
    }else
    {
      $("#bullet-list").animate({ 
        right:40 
        }); 
    }
    }
    if( $('#sidebar .workspace-leaf-content').css('width')) { //
      $('#sidebar .workspace-leaf-content').animate({ 
        width:0 
      });
     
    }
   

});
});
