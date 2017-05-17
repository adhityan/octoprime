class IssueView {
  constructor($dom, store, adapter) {
    this.store = store
    this.adapter = adapter
    this.$view = $dom.find('.octotree_issues_view')
    this.$panel = this.$view.find('.octotree_view_body')
      .on('click', '.issue_button_like', this._onLikeClick.bind(this))
      .on('click', '.issue_button_volunteer', this._onVolunteerClick.bind(this))
    this.$hideIssueLink = $dom.find('.octoprime_links_browse').click(this._hide.bind(this))
    this.$showIssueLink = $dom.find('.octoprime_links_contribute').click(this._show.bind(this))
  }

  _show() {
    $(this).trigger(EVENT.VIEW_READY)
  }

  _hide() {
    $(this).trigger(EVENT.VIEW_CLOSE)
  }

  _showHeader(repo) {
    const adapter = this.adapter

    this.$view.find('.octotree_view_header')
      .html(
        '<div class="octotree_header_repo">' +
        '<a href="/' + repo.username + '">' + repo.username +'</a>'  +
        ' / ' +
        '<a data-pjax href="/' + repo.username + '/' + repo.reponame + '">' + repo.reponame +'</a>' +
        '</div>' +
        '<div class="octotree_header_branch">' +
        "Issues" +
        '</div>'
      )
      .on('click', 'a[data-pjax]', function (event) {
        event.preventDefault()
        const href = $(this).attr('href'); /* a.href always return absolute URL, don't want that */
        const newTab = event.shiftKey || event.ctrlKey || event.metaKey
        newTab ? adapter.openInNewTab(href) : adapter.selectFile(href)
      })
  }

  load(repo, token) {
    this._showHeader(repo)

    this.adapter.loadIssues({repo, token}, (err, treeData) => {
      if (err) {
        $(this).trigger(EVENT.FETCH_ERROR, [err])
      }
      else {
        let content = '<ul class=\'issues_list\'>'
        console.log('here', treeData)
        treeData.forEach((item) => {
          content += '<li>'
                  +  this._issueHtml(item)
                  +  '</li>'
        })
        content += '</ul>'
        this.$panel.html(content)
      }
    })
  }

  _issueHtml(issue) {
    return '<div class=\'issue_entry\' data-id=\'' + issue.number + '\'>'
          +'<div class=\'issue_title\'>'
          +'<a href=\'' + issue.url + '\'>'
          +issue.title
          +'</a></div>'
          +'<div class=\'issue_buttons\'>'
          +'<div class=\'issue_button issue_button_like'
          + ((issue.reactions.user_reaction)?' issue_button_like_reacted':'')
          + '\'>'
          +'<span class=\'issue_button_counter issue_button_like_count\'>' + issue.reactions.positive +'</span>'
          +'</div>'
          +'<div class=\'issue_button issue_button_volunteer'
          + ((issue.is_user_assigned)?' issue_button_volunteer_reacted':'')
          + '\'>'
          +'<span class=\'issue_button_counter issue_button_volunteer_count\'>' + issue.assignees.length +'</span>'
          +'</div></div></div>';
  }

  _onLikeClick(event) {
    const $target = $(event.target)
    const issueId = $target.closest('.issue_entry').data('id')
    const has_reacted = $target.hasClass('issue_button_like_reacted')
    console.log('yo', issueId, has_reacted, $target)

    if(has_reacted) {
      $target.removeClass('issue_button_like_reacted')
    }
    else {
      $target.addClass('issue_button_like_reacted')
    }
  }

  _onVolunteerClick(event) {
    const $target = $(event.target)
    const issueId = $target.closest('.issue_entry').data('id')
    const has_reacted = $target.hasClass('issue_button_volunteer_reacted')

    if(has_reacted) {
      $target.removeClass('issue_button_volunteer_reacted')
    }
    else {
      $target.addClass('issue_button_volunteer_reacted')
    }
  }
}
