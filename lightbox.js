;(function ($) {
  var Lightbox = function () {
    var self = this;

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
    })
  };

  Lightbox.prototype = {
    showMaskAndPopup: function(sourceSrc, currentId) {
      var self = this;
      //this.popupPic.hide();
      //this.picCaptionArea.hide();

      //this.popupMask.fadeIn();

      var bodyWidth = $(window).width();
      var bodyHeight = $(window).height();

      this.picViewArea.css({
        "width": bodyWidth / 2,
        "height": bodyHeight / 2
      })

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
        '<div id="lightbox-popup">' +
        '<div class="lightbox-pic-view">' +
        '<span class="lightbox-btn lightbox-prev-btn icon-arrow-with-circle-left"></span>' +
        '<img class="lightbox-image" src="images/1.jpg" width="100%">' +
        '<span class="lightbox-btn lightbox-next-btn icon-arrow-with-circle-right"></span>' +
        '</div>' +
        '<div class="lightbox-pic-caption">' +
        '<div class="lightbox-caption-area">' +
        '<p class="lightbox-pic-desc">Image Title</p>' +
        '<span class="lightbox-index">Current Index: 1 of 4</span>' +
        '</div>' +
        '<span class="lightbox-close-btn icon-cross"></span>' +
        '</div>' +
        '</div>';

      this.popupBody.html(strDOM);
      this.bodyNode.append(this.popupMask, this.popupBody);
    }

  };
  window['Lightbox'] = Lightbox;

})(jQuery);