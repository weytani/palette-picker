$(document).ready(() => {
  getColors();
  fetchProjects();
  fetchPalettes();
  console.log("you're in")
});

// generate random colors
const randomColor = () => {
  return '#' + (Math.random() * (1 << 24) | 0).toString(16);
}

// assign colors to DOM

const getColors = () => {
  $('.color').each( function() {
    if (!$(this).hasClass('locked')) {
      const newColor = randomColor()
      $(this).css('background-color', newColor)
      $(this).find('.hex').text(newColor)
    };
  });
}

function appendColors() {
  console.log($(this).val());
  $(this).val()
  $(".color").each(function() {
    if (!$(this).hasClass("locked")) {
      const newColor = randomColor();
      $(this).css("background-color", newColor);
      $(this)
        .find(".hex")
        .text(newColor);
    }
  });
}

// dropdown
$(function () {

  $("ul.dropdown li").hover(function () {

    $(this).addClass("hover");
    $('ul:first', this).css('visibility', 'visible');

  }, function () {

    $(this).removeClass("hover");
    $('ul:first', this).css('visibility', 'hidden');

  });

  $("ul.dropdown li ul li:has(ul)").find("a:first").append(" &raquo; ");

});


// fetch projects
const fetchProjects = async () => {
  const projectsFetch = await fetch('http://localhost:3000/api/v1/projects/')
  const projectsData = await projectsFetch.json()

  return appendProjects(projectsData);
}

const appendProjects = (projects) => {
  projects.forEach((project, index) => {
    // make conditional -- if project.id exists don't append
    $('ul.sub_menu').append(`<li class="project-${project.id} project" id="${project.id} value="${project.project}"><a href="#" class="project-name" value="${project.id}">${project.project}&raquo;</a><ul class="palette-list-${project.id} palette-list"></ul></li>`)
  })

  $('.sub_menu').on('click', (event) => selectProject(event));
}

const saveProject = async () => {
  const project = $('.project-save-input').val();

  const savePost = await fetch('http://localhost:3000/api/v1/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ project })
  });

  const response = await savePost.json();
  console.log(response)
  $('.name-display').text(project);
  $('.name-display').attr('id', response.id);
  $('.project-save-input').val('');
};

const fetchPalettes = async () => {
  const palettesFetch = await fetch('http://localhost:3000/api/v1/palettes/')
  const palettesData = await palettesFetch.json();
  console.log(palettesData)

  return appendPalettes(palettesData);
}

const selectProject = (event) => {
  const { target } = event;

  if ($(target).attr('class') === 'palette-list') {
    const project = $(target).closest('.project').find('.project-name').text();
    const projectID = $(target).attr('value')
    console.log(projectID)
    $('.name-display').text(project);
    $('.name-display').attr('id', projectID);
    
    return;
  }
  console.log('it hits this too')
  const project = $(target).text();
  const projectID = $(target).attr('value')
  console.log(projectID)
  $('.name-display').text(project);
  $('.name-display').attr('id', projectID);
}

const appendPalettes = (palettes) => {
  console.log(palettes)
  palettes.forEach((palette, index) => {
    console.log(palette)
    console.log(`ul.palette-list-${palette.project_id}`)
    // make conditional -- if palette.id exists don't append
    $(`ul.palette-list-${palette.project_id}`).append(`
      <li class="palette-${palette.id} palette" value="${palette.project_id}">
        <a href="#" class="palette-list" value="${palette.project_id}">${palette.palette}</a>
        <div class="saved-palettes" value="${palette.project_id}" style="background-color:${palette.hex1}"></div>
        <div class="saved-palettes" value="${palette.project_id}" style="background-color:${palette.hex2}"></div>
        <div class="saved-palettes" value="${palette.project_id}" style="background-color:${palette.hex3}"></div>
        <div class="saved-palettes" value="${palette.project_id}" style="background-color:${palette.hex4}"></div>
        <div class="saved-palettes" value="${palette.project_id}" style="background-color:${palette.hex5}"></div>
        <div class="saved-palettes delete">X</div> 
      </li>`);
  })
}

const savePalette = async () => {
  const palette = $('.palette-save-input').val();
  const project = $('.name-display').text();
  const project_id = $('.name-display').attr('id');
  let colors = {
    hex1: $('.color-1-text').text(),
    hex2: $('.color-2-text').text(),
    hex3: $('.color-3-text').text(),
    hex4: $('.color-4-text').text(),
    hex5: $('.color-5-text').text()
  }
  console.log(project_id)
  const combinedPalette = { palette, ...colors }
  console.log(combinedPalette)
  const savePost = await fetch(`http://localhost:3000/api/v1/projects/${project_id}/palettes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(combinedPalette)
  });

  const response = await savePost.json();
  console.log(response)
  colors = [colors]
  appendPalettes(colors)
  $('.name-display').text(project);
  $('.name-display').attr('id', response.id);
  $('.palette-save-input').val('');
}

const selectPalette = () => {

}

const deletePalette = async () => {

}

document.body.onkeyup = function (event) {
  if (event.keyCode === 32 && event.target === document.body) {
    getColors();
  }
};

$('.lock').on('click', (event) => {
  $(event.target).parents('.color').toggleClass('locked');
  $(event.target).toggleClass('closed');
})
$('li').on('click', appendColor)
$('.project-save').on('click', saveProject);
$('.palette-save').on('click', savePalette);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {

    // Register a new service worker
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => navigator.serviceWorker.ready)
      .then(registration => {
        Notification.requestPermission();
        console.log('ServiceWorker registration successful');
      }).catch(err => {
        console.log(`ServiceWorker registration failed: ${err}`);
      });

  });
}

const notifyPaletteAdded = (palette) => {
  navigator.serviceWorker.controller.postMessage({
    type: 'add-palette',
    palette
  })
}


 