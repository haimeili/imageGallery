;(function ($) {
  var Lightbox = function (settings) {
    var self = this;

    this.settings = {
      speed : 500,
      maxWidth: 800,
      maxHeight: 600,
      maskOpacity:.4
    };

    $.extend(this.settings, settings || {});

    // create mask and popup
    this.popupMask = $('<div id="lightbox-mask">');
    this.popupBody = $('<div id="lightbox-popup">');

    // save body
    this.bodyNode = $(document.body);

    // render rest DOM and insert to body
    this.renderDOM();

    this.picViewArea = this.popupBody.find("div.lightbox-pic-view");
    this.popupPic = this.popupBody.find("img.lightbox-image");
    this.picCaptionArea = this.popupBody.find("div.lightbox-pic-caption");
    this.nextBtn = this.popupBody.find("span.lightbox-next-btn");
    this.prevBtn = this.popupBody.find("span.lightbox-prev-btn");
    this.captionText = this.popupBody.find("p.lightbox-pic-desc");
    this.currentIndex = this.popupBody.find("span.lightbox-index");
    this.closeBtn = this.popupBody.find("span.lightbox-close-btn");

    // prepare event to body and obtain data
    this.groupName = null;
    this.groupData = [];
    this.bodyNode.delegate(".js-lightbox,*[data-role=lightbox]", "click", function (event) {
      // prevent popup event
      event.stopPropagation();
      var currentGroupName = $(this).data("group");
      if (currentGroupName != self.groupName) {
        self.groupName = currentGroupName;
        // obtain group data by groupName
        self.getGroup();
      }

      // init popup
      self.initPopup($(this));
    });

    // close popup
    this.popupMask.click(function() {
      $(this).fadeOut();
      self.popupBody.fadeOut();
      self.clear = false;
    });

    this.closeBtn.click(function() {
      self.popupMask.fadeOut();
      self.popupBody.fadeOut();
      self.clear = false;
    });

    this.flag = true;

    this.nextBtn.hover(function(){
      if (!$(this).hasClass("disabled") && self.groupData.length > 1) {
        $(this).addClass("icon-arrow-with-circle-right");
      }
    }, function() {
      $(this).removeClass("icon-arrow-with-circle-right");

    }).click(function(event) {
      if (!$(this).hasClass("disabled") && self.flag) {
        self.flag = false;
        event.stopPropagation();
        self.goto("next");
      }
    });

    this.prevBtn.hover(function(){
      if (!$(this).hasClass("disabled") && self.groupData.length > 1) {
        $(this).addClass("icon-arrow-with-circle-left");
      }
    }, function() {
      $(this).removeClass("icon-arrow-with-circle-left");
    }).click(function(event) {
      if (!$(this).hasClass("disabled") && self.flag) {
        self.flag = false;
        event.stopPropagation();
        self.goto("prev");
      }
    });

    // bind window rescale event
    var timer = null;
    this.clear = false;
    $(window).resize(function() {
      if(self.clear) {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          self.loadPicSize(self.groupData[self.index].src);
        }, 500);
      }
    }).keyup(function(event) {
      if (self.clear) {
        var keyValue = event.which;
        if (keyValue == 38 || keyValue == 37) {
          self.prevBtn.click();
        } else if (keyValue == 40 || keyValue == 39) {
          self.nextBtn.click();
        }
      }
    })

  };

  Lightbox.prototype = {
    goto: function(dir) {
      if (dir === "next") {
        this.index++;
        if (this.index >= this.groupData.length - 1) {
          this.nextBtn.addClass("disabled").removeClass("icon-arrow-with-circle-next");
        }
        if (this.index != 0) {
          this.prevBtn.removeClass("disabled");
        }
        var src = this.groupData[this.index].src;
        this.loadPicSize(src);
      } else if (dir == "prev") {
        this.index--;
        if (this.index <= 0) {
          this.prevBtn.addClass("disabled").removeClass("icon-arrow-with-circle-left");
        }
        if (this.index != this.groupData.length - 1) {
          this.nextBtn.removeClass("disabled");
        }
        var src = this.groupData[this.index].src;
        this.loadPicSize(src);
      }
    },
    loadPicSize: function(sourceSrc) {
      var self = this;
      self.popupPic.css({
        width: "auto",
        height: "auto"
      }).hide();
      this.preLoadImg(sourceSrc, function(){
        self.popupPic.attr("src", sourceSrc);
        self.popupPic.attr("style", "display: block");
        var picWidth = self.popupPic.width();
        var picHeight = self.popupPic.height();
        self.changePic(picWidth, picHeight);
      })
    },
    changePic: function(picWidth, picHeight) {
      var self = this;

      // if pic's size is bigger than view,
      var scale = Math.min($(window).width()/(picWidth+100), $(window).height()/(picHeight+200, 1));

      var width = (picWidth*scale-100) * .7;
      width = width < self.settings.maxWidth ? width:self.settings.maxWidth;
      var height = (picHeight*scale-200) * .7;
      height = height < self.settings.maxHeight ? height:self.settings.maxHeight;
      self.picViewArea.animate({
        width: width,
        height: height
      }, self.settings.speed);

      this.popupBody.animate({
        maxWidth: width,
        maxHeight: height,
        marginLeft: -(width/2),
        top: ($(window).height() - height)/2
      }, self.settings.speed, function() {
        self.popupPic.css({
          width: width,
          height: height
        }).fadeIn()
      });

      self.flag = true;
      self.clear = true;

      self.picCaptionArea.attr("style", "display: block");
      this.captionText.text(this.groupData[this.index].caption);
      this.currentIndex.text("Current Index: " + (this.index + 1) + " of " + this.groupData.length);
    },
    preLoadImg: function(src, callback){
      var img = new Image();
      if (!!window.ActiveXObject) {
        img.onreadystatechange = function() {
          if (this.readyState == "complete") {
            callback();
          }
        }
      } else {
        img.onload = function() {
          callback();
        }
      }
      img.src = src;
    },
    showMaskAndPopup: function(sourceSrc, currentId) {
      var self = this;

      this.popupPic.hide();
      this.picCaptionArea.hide();

      this.popupMask.attr("style", "display: block;");
      this.popupMask.css("opacity", self.settings.maskOpacity);

      var winWidth = $(window).width();
      var winHeight = $(window).height();

      var viewWidth =  winWidth / 2;
      var viewHeight = winHeight / 2;

      this.picViewArea.css({
        width: viewWidth,
        height: viewHeight
      });

      this.popupBody.attr("style", "display: block;");
      this.popupBody.css({
        width: viewWidth,
        height: viewHeight,
        top: -500
      }).animate({
        top: 150
      }, self.settings.speed, function(){
        // load image
        self.loadPicSize(sourceSrc);
      });

      this.index = this.getIndexOf(currentId);
      var groupDataLength = this.groupData.length;
      if (groupDataLength > 1) {
        if (this.index === 0) {
          this.prevBtn.addClass("disabled");
          this.nextBtn.removeClass("disabled");
        } else if (this.index === groupDataLength - 1) {
          this.prevBtn.removeClass("disabled");
          this.nextBtn.addClass("disabled");
        } else {
          this.prevBtn.removeClass("disabled");
          this.nextBtn.removeClass("disabled");

        }
      }

    },
    getIndexOf: function(currentId) {
      var index = 0;
      $(this.groupData).each(function(i) {
        index = i;
        if (this.id === currentId) {
          return false;
        }
      });

      return index;
    },
    initPopup: function(currentObj) {
      var self = this;
      var sourceSrc = currentObj.data("source");
      var currentId = currentObj.data("id");
      this.showMaskAndPopup(sourceSrc, currentId);
    },
    getGroup: function () {
      var self = this;
      // obtain group data by groupName
      var groupList = this.bodyNode.find("*[data-group=" + this.groupName + "]");
      // clean up group data
      self.groupData.length = 0;
      groupList.each(function () {
        self.groupData.push({
          src: $(this).data("source"),
          id: $(this).data("id"),
          caption: $(this).data("caption")
        });
      });
    },
    renderDOM: function () {
      var strDOM =
        '<div class="lightbox-pic-view">' +
        '<span class="lightbox-btn lightbox-prev-btn icon-arrow-with-circle-left"></span>' +
        '<img class="lightbox-image">' +
        '<span class="lightbox-btn lightbox-next-btn icon-arrow-with-circle-right"></span>' +
        '</div>' +
        '<div class="lightbox-pic-caption">' +
        '<div class="lightbox-caption-area">' +
        '<span class="lightbox-pic-desc">Image Title</span>' +
        '<span class="lightbox-index">Current Index: 1 of 4</span>' +
        '</div>' +
        '<span class="lightbox-close-btn icon-cross"></span>' +
        '</div>';

      this.popupBody.html(strDOM);
      this.bodyNode.append(this.popupMask, this.popupBody);
    }

  };
  window['Lightbox'] = Lightbox;

})(jQuery);