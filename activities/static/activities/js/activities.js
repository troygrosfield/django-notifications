// js handling for activities.
$(document).ready(function(){
    
    /**
     * Gets the loading html when the paging button is clicked.
     */
    function getLoadingHtml(){
        return '<div class="progress progress-striped active"><div class="progress-bar progress-bar-info bar">Loading...</div></div>';
    }

    
    /**
     * This is for activities handling.
     *
     * Required data attributes:
     * 
     *  - data-ajax="activities"
     *  
     * Usage:
     * 
     * <div data-ajax="activities">...</div>
     */
    function addEventListeners($activitiesContainers) {
        
        $activitiesContainers.each(function() {
            
            var $activitiesContainer = $(this);
            
            /**
             * Add event listener for infinite scroll if the activity container needs it
             * This only works with the jquery "inView()" plugin.  If that doesn't 
             * exist, the infinite scroll won't work.
             * 
             * @see activities/static/activities/js/jquery.in-view.js
             */
            if ($activitiesContainer.is('[data-infinite_scroll="true"]') && 
                typeof $().inView === 'function' &&
                $activitiesContainer.find('> .activities-paging').length > 0) {
                // add infinite scroll event listener
                $(window).on('scroll', function(e) {
                    var $hasMoreButton = $activitiesContainer.find('> .activities-paging .has-more');
                    
                    if ($hasMoreButton.length > 0 && $hasMoreButton.inView()) {
                        $hasMoreButton.click();
                    }
                });
            }
            
            
            $activitiesContainer.on('click', '.activity .delete-activity form button',  function(e){
                var $frm = $(this).closest('form'),
                    formData = $frm.serialize();
                
                e.preventDefault(); 
                
                $.post($frm.attr('action'), formData, function(resp_text, success_fail, resp){
                    if (resp.status === 200){
                        $frm.closest('.activity-container').remove();
                    } else if (window.console && window.console.log) {
                        window.console.log('There was an error deleting the activity.');
                    }
                });
                
            }).on('click', '.activities-paging .has-more', function(e){
                e.preventDefault();
                
                var $this = $(this),
                    url = $this.attr('href');
                
                $this.replaceWith(getLoadingHtml());
                
                $.get(url, function(data){
                    var $data = $(data);
                    
                    $('.activities-paging').remove();
                    
                    $activitiesContainer.find('> ul.activities').append($data.find('> .activities > li'));
                    $activitiesContainer.append($data.find('> .activities-paging'));
                    $activitiesContainer.trigger('activities.contentupdated', data);
                });
                
            }).on('click', 'ul.activity-type a', function(e){
                e.preventDefault();
                
                var $this = $(this),
                    $parentType = $this.closest('.activity-type'),
                    $activitiesContainer = $this.closest('.activities-container'),
                    $activities = $activitiesContainer.find('.activities:first'),
                    $linkContainer = $this.closest('li'),
                    url = $this.attr('href');
                
                if ($linkContainer.is('.active')) {
                    // This is already active, nothing to do.
                    return false;
                }
                
                $this.blur();        
                $parentType.find('li').removeClass('active');
                $linkContainer.addClass('active');
                
                $activitiesContainer.find('.activities-paging').html(getLoadingHtml());
                
                $.get(url, function(data){
                    var $data= $(data);
                    $activities.replaceWith($data.find('> .activities'));
                    $activitiesContainer.find('.activities-paging').remove();
                    $activitiesContainer.append($data.find('.activities-paging'));
                    $activitiesContainer.trigger('activities.contentupdated', data);
                });
                
            }).on('focus', 'form.comment-form textarea', function(e){
                e.preventDefault();
                var $this = $(this);
                
                if ($this.data('origHeight') === undefined){
                    $this.data('origHeight', $this.css('height'));
                }
                
                $this.css('height', '75px');
                
            }).on('blur', 'form.comment-form textarea', function(e) {
                var $this = $(this);
                
                if ($.trim($this.val()) === ''){
                    $this.css('height', $this.data('origHeight'));
                }
                
            }).on('submit', 'form.comment-form', function(e){
                e.preventDefault();
                var $this = $(this),
                    $activitiesContainer = $this.closest('.activities-container')
                    $textField = $this.find('textarea[name="text"]'),
                    formData = $this.serialize(),
                    text = $.trim($textField.val());
                
                if (!text) {
                    // No text in the comment.  Nothing to do.
                    return false;
                }
                
                $.post($this.attr('action'), formData, function(resp_text, success_fail, resp){
                    var $activities = $activitiesContainer.find('.activities:first');
                    
                    if (resp.status === 200 || resp.status === 202) {
                        $activities.find('.no-activities-found').remove();
                        $activities.prepend(resp_text.activity);
                        $textField.val('');
                        $textField.blur();
                    } else if (window.console && window.console.log) {
                        window.console.log('There was an error adding the comment.');
                    }
                });
                
            }).on('submit', 'form.comment-reply-form', function(e){
                
                e.preventDefault();
                
                var $this = $(this),
                    formData = $this.serialize(),
                    activityId = $this.find('input[name="parent_activity"]').val(),
                    $input = $this.find('input[name="text"]'),
                    text = $.trim($input.val());
                
                if (!text) {
                    // No text in the comment.  Nothing to do.
                    return false;
                }
                
                $.post($this.attr('action'), formData, function(resp_text, success_fail, resp) {
                    var $activity = $('#n-' + activityId),
                        $replyContainer = $activity.find('.reply-container'),
                        $replyCount = $activity.find('.reply-count'),
                        replyCount = parseInt($replyCount.text()) || 0;
                    
                    if (resp.status === 200 || resp.status === 202){
                        $replyContainer.append($(resp_text.activity_reply));
                        $replyContainer.scrollTop($replyContainer.outerHeight());
                        $input.val('');
                        
                        // increment the comment count.
                        if ($replyCount.length > 0) {
                            $replyCount.text(replyCount + 1);
                        }
                    } else if (window.console && window.console.log) {
                        window.console.log('There was an error adding the activity reply.');
                    }
                });
                
            }).on('submit', 'form.delete-activity', function(e){
                
                e.preventDefault();
                var $this = $(this),
                    formData = $this.serialize(),
                    activityId = $this.find('input[name="nid"]').val();
                
                $.post($this.attr('action'), formData, function(resp_text, success_fail, resp){
                    
                    if (resp.status === 200){
                        $('#n-' + activityId).remove();
                    } else if (window.console && window.console.log) {
                        window.console.log('There was an error deleting the activity.');
                    }
                });
            });
            
            
            /**
             * Gets the activity replies and loads via ajax.
             * 
             * @param $activity: the activity get the replies for
             * @param url: the url to fetch the replies for.
             * @param callback: function to run after the replies have been retrieved.
             */
            function getActivityReplies($activity, url, callback) {
                if (url === undefined) {
                    url = $activity.data('url');
                }
                
                $.get(url, function(data){
                    var $data= $(data),
                        $replyContainer = $activity.find('.reply-container:first');
                    
                    // remove the see more replies link
                    $replyContainer.find('.see-more-replies').remove();
                    
                    if (data) {
                        $replyContainer.prepend($data.html());
                    }
                    
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            }
            
            // add the single activity event listeners
            if ($activitiesContainer.has('.single-activity').length > 0) {
                $activitiesContainer.on('click', '.see-more-replies a', function(e) {
                    // get more replies
                    e.preventDefault();
                    var $link = $(this);
                    getActivityReplies($link.closest('.activity'), $link.attr('href'));
                });
            } else {
                // activities specific to non-single activities
                $activitiesContainer.on('click', '.social-actions .comment-on-activity', function() {
                    var $button = $(this),
                        replyCount = parseInt($button.find('.reply-count').text()) || 0,
                        $activity = $button.closest('.activity'),
                        $replies = $activity.find('.replies'),
                        $commentReplyForm = $activity.find('.comment-reply-form'),
                        repliesUrl = $commentReplyForm.attr('action'),
                        $seeMore;
                    
                    if ($replies.is(':visible')) {
                        $replies.hide();
                    } else {
                        $replies.show();
                        
                        if (replyCount === 0) {
                            // no replies to load
                            $button.data('loadedReplies', true);
                        }
                        
                        if ($button.data('loadedReplies') === undefined) {
                            // load the activities then remove the event listener since
                            // we only want to load the first page.
                            getActivityReplies($activity, $activity.data('url') + '?ps=5', function() {
                                // update the show more url to not have querystring params
                                $seeMore = $replies.find('.see-more-replies a');
                                
                                if ($seeMore.length > 0) {
                                    $seeMore.attr('href', $seeMore.attr('href').split('?')[0]);
                                }
                            });
                            
                            $button.data('loadedReplies', true);
                        }
                        
                        $commentReplyForm.find('input[name=text]').focus();
                    }
                    
                });
            }
        });
        
    }
    
    // adds the event listeners
    addEventListeners($('.activities-container'));
    
});
