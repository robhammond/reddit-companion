var port, fullname, info, loggedIn

function likeDelta(likes) {
  if (likes == true) {
    return 1
  } else if (likes == false) {
    return -1
  } else {
    return 0
  }
}

function vote(likes) {
  info.score += likeDelta(likes) - likeDelta(info.likes)
  info.likes = likes
  update()
  port.postMessage({action:'vote', likes:info.likes})
}

function toggleSaved() {
  info.saved = !info.saved
  update()
  if (info.saved) {
    port.postMessage({action:'save'})
  } else {
    port.postMessage({action:'unsave'})
  }
}

function update() {
  $('body').width('9999px')
  if (loggedIn) {
    $('#bar').removeClass('logged-out').addClass('logged-in')
  } else {
    $('#bar').removeClass('logged-in').addClass('logged-out')
  }

  if (info.likes == true) {
    $('#bar').removeClass('disliked').addClass('liked')
  } else if (info.likes == false) {
    $('#bar').removeClass('liked').addClass('disliked')
  } else {
    $('#bar').removeClass('liked disliked')
  }
  if (info.saved == true) {
    $('#bar').addClass('saved')
  } else {
    $('#bar').removeClass('saved')
  }
  $('#score').text(info.score)
  $('#title').text(info.title)
  if (info.subreddit) {
    $('#subreddit').text('[' + info.subreddit + ']')
  } else {
    $('#bar').removeClass('subreddit')
  }
  $('#comments span').text(info.num_comments)

  window.setTimeout(function() {
    // Note: there's an interesting interaction here: if a size change is necessary, this will lead to
    // a resize() event, calling update() again. If the outerWidth/outerHeight haven't changed, a second
    // call will presumably have no effect, and not call resize(). However, if the dimensions *have* changed,
    // we'll spin around again and again until the outerWidth/outerHeight are unaffected by the size change.
    //
    // This comes into affect often when the number of lines changes due to wrapping and width change. Thanks
    // to the recursive-ish sizing, the height will successfully update if a prior width change caused line 
    // flow to change.
    msgJSON({action:'size', width:$('#bar').outerWidth(), height:$('#bar').outerHeight()})
    $('body').width('100%')
  }, 10)
}

$(document).ready(function() {
  $(window).resize(function() {
    console.log('Resize alert detected updating shine display.')
    handleData()
  })

  $('#comments').click(function(e) {
    clickOpenURL(e, 'http://reddit.com'+info.permalink)
  })
  
  $('#like').click(function() {
    vote(info.likes == true ? null : true)
  })

  $('#dislike').click(function() {
    vote(info.likes == false ? null : false)
  })

  $('#save').click(function() {
    toggleSaved()
  })

  $('#login').click(function () {
    window.open('http://reddit.com/login/')
  })

  $('#close').click(function() {
    msgJSON({action:'close'})
  })

})

fullname = window.location.hash.substr(1)
port = chrome.extension.connect({name:'bar:'+fullname})
port.onMessage.addListener(function(msg) {
  switch (msg.action) {
    case 'update':
      info = msg.info
      loggedIn = msg.loggedIn
      update()
      break
  }
})
port.postMessage({action:'update', useStored:'true'})
