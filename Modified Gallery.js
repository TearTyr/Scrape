// ==UserScript==
// @name         Modified Kemono Galleries
// @version      1.0
// @description  Load original resolution, toggle fitted zoom views, remove photos. Use a plug-in for batch download, can't do cross-origin image downloads with JS alone.
// @author       ntf
// @author       Modified by Meri
// @match        *://kemono.party/*/user/*/post/*
// @match        *://coomer.party/*/user/*/post/*
// @icon         https://kemono.party/static/menu/recent.svg
// @grant        GM.xmlHttpRequest
// @license      Unlicense
// ==/UserScript==

// Define constants for button labels
const DLALL = '【DL ALL】';
const DL = '【DOWNLOAD】';
const WIDTH = '【FILL WIDTH】';
const HEIGHT = '【FILL HEIGHT】';
const FULL = '【FULL】';
const RM = '【REMOVE】';

function Height() {
    document.querySelectorAll('.post__image').forEach(img => height(img));
}

function height(img) {
    img.style.maxHeight = '100vh';
    img.style.maxWidth = '100%';
}

function Width() {
    document.querySelectorAll('.post__image').forEach(img => width(img));
}

function width(img) {
    img.style.maxHeight = '100%';
    img.style.maxWidth = '100%';
}

function Full() {
    document.querySelectorAll('.post__image').forEach(img => full(img));
}

function full(img) {
    img.style.maxHeight = 'none';
    img.style.maxWidth = 'none';
}

function newToggle(name, action) {
    const toggle = document.createElement('a');
    toggle.text = name;
    toggle.addEventListener('click', action);
    toggle.style.cursor = 'pointer';
    return toggle;
}

function resizer(evt) {
    const name = evt.currentTarget.text;
    const img = evt.currentTarget.parentNode.nextSibling.lastElementChild;
    if (name === WIDTH) width(img);
    else if (name === HEIGHT) height(img);
    else if (name === FULL) full(img);
}

function removeImg(evt) {
    evt.currentTarget.parentNode.nextSibling.remove();
    evt.currentTarget.parentNode.remove();
}

//image refresher
function handleImageError(evt) {
  const img = evt.currentTarget;
  img.src = img.src;
}


const images = document.querySelectorAll('.post__image');

images.forEach((img) => {
  img.addEventListener('error', handleImageError);
});

function downloadImg(evt) {
  evt.preventDefault();
  const img = evt.currentTarget.parentNode.nextSibling?.lastElementChild;
  if (img) {
    const imgSrc = img.getAttribute('src');
    const titleElement = document.querySelector('.post__title');
    const title = `${titleElement.querySelector('span:first-child').textContent.trim()} ${titleElement.querySelector('span:last-child').textContent.trim()}`;
    const username = document.querySelector('.post__user-name').textContent.trim();
    const imgName = `${title}_${username}.png`.replace(/[\\/:*?"<>|]/g, '-');
    GM.xmlHttpRequest({
      method: 'GET',
      url: imgSrc,
      responseType: 'blob',
      onload: function (response) {
        const url = window.URL.createObjectURL(response.response);
        const a = document.createElement('a');
        a.href = url;
        a.download = imgName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      onerror: function (error) {
        console.error(error);
      }
    });
  }
}


function DownloadAllImages() {
  const images = document.querySelectorAll('.post__image');
  images.forEach((img, index) => {
    const imgSrc = img.getAttribute('src');
    const titleElement = document.querySelector('.post__title');
    const title = `${titleElement.querySelector('span:first-child').textContent.trim()} ${titleElement.querySelector('span:last-child').textContent.trim()}`;
    const username = document.querySelector('.post__user-name').textContent.trim();
    const imgName = `${title}_${username}_${index}.png`.replace(/[\\/:*?"<>|]/g, '-');
    setTimeout(() => {
      GM.xmlHttpRequest({
        method: 'GET',
        url: imgSrc,
        responseType: 'blob',
        onload: function (response) {
          const url = window.URL.createObjectURL(response.response);
          const a = document.createElement('a');
          a.href = url;
          a.download = imgName;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        onerror: function (error) {
          console.error(error);
        }
      });
    }, 250 * index);
  });
}


(function() {
    'use strict';

    document.querySelectorAll('a.fileThumb.image-link img').forEach(img => (img.className = 'post__image'));

    let A = document.querySelectorAll('a.fileThumb.image-link');
    let IMG = document.querySelectorAll('.post__image');
    for (let i = 0; i < A.length; i++) {
        IMG[i].setAttribute('src', A[i].getAttribute('href'));
        IMG[i].test = i;
        A[i].outerHTML = A[i].innerHTML;
    }

    let DIV = document.querySelectorAll('.post__thumbnail');
    let parentDiv = DIV[0].parentNode;
    for (let i = 0; i < DIV.length; i++) {
        let newDiv = document.createElement('div');
        newDiv.append(newToggle(WIDTH, resizer), newToggle(HEIGHT, resizer), newToggle(FULL, resizer), newToggle(DL, downloadImg), newToggle(RM, removeImg));
        parentDiv.insertBefore(newDiv, DIV[i]);
    }

    Full();

    document.querySelector('.post__actions').append(newToggle(WIDTH, Width), newToggle(HEIGHT, Height), newToggle(FULL, Full), newToggle(DLALL, DownloadAllImages));

})();
