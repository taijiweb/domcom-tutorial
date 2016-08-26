/**
 * This file provided by taijiweb is for non-commercial testing and evaluation
 * purposes only. Taijiweb reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function() {
  var div = dc.div,
    h1 = dc.h1,
    h2 = dc.h2,
    form = dc.form,
    input = dc.input,
    text = dc.text,
    html = dc.html,
    each = dc.each,
    extend = dc.extend;

  var md = Remarkable();

  var comment = function (author, content) {
    return div({className: "comment"},
      h2({className: "commentAuthor"}, author),
      html(content, md.render.bind(md))
    );
  };

  function makeCommentList(comments) {
    return each(comments, function(item) {
      return comment(item.author, item.text);
    })
  }

  function makeCommentForm(submitComment) {
    var newComment = {author: '', text: ''};
    return form({className: "commentForm"},
      text({
        placeholder: "Your name",
        value: newComment.author,
        onchange:function(event, node){
          newComment.author = node.value;
        }
      }),
      text({
        placeholder: "Say something...",
        value: newComment.text,
        onchange: function(event, node){
          newComment.text = node.value;
        }
      }),
      input({
        type: "submit",
        value: "Post",
        onsubmit: function(event, node) {
          event.preventDefault = true;
          var author = newComment.author.trim();
          var text = newComment.text.trim();
          if (!text || !author) {
            return;
          }
          submitComment(newComment);
          extend(newComment, {author: '', text: ''});
        }
      })
    );
  }

  function makeCommentBox(url, pollInterval) {
    url = url || "/api/comments";
    pollInterval = pollInterval || 2000;

    var comments = [];

    var commentBox = div({className: "commentBox"},
      h1("Comments"),
      makeCommentList(comments),
      makeCommentForm(function (newComment) {
        $.ajax({
          url: url,
          dataType: 'json',
          type: 'POST',
          data: newComment,
          success: function (data) {
            comments.replaceAll(data);
            commentBox.render();
            dc.clean();
          },
          error: function (xhr, status, err) {
            console.error(url, status, err.toString());
          }
        });
        comments.push(newComment);
        commentBox.render();
      })
    );

    function loadCommentsFromServer() {
      $.ajax({
        url: url,
        dataType: 'json',
        cache: false,
        success: function (data) {
          comments.replaceAll(data);
        },
        error: function (xhr, status, err) {
          console.error(url, status, err.toString());
        }
      });
    }

    commentBox.on('didMount', function () {
      loadCommentsFromServer();
      setInterval(loadCommentsFromServer, pollInterval);
    });

    return commentBox;
  }

  var commentBox = makeCommentBox();
  commentBox.mount();

})();
