/*

main.js

*/

import $ from 'jquery';

import { Logic } from './logic';
import Graphics from './graphics';
import { Gui } from './graphics/gui/gui';

// ~~~

// bindowanie wyświetlania logów konsoli na ekran,
// może być pomocne tymczasowo
var originalConsoleLog = console.log;
console.log = function (msg, show) {
  originalConsoleLog.apply(console, arguments);

  if (show !== false) {
    var newElement = document.createElement('div');
    newElement.appendChild(document.createTextNode(msg));

    setTimeout(function () {
      $(newElement).parent().find('br').eq(0).remove();
      $(newElement).remove();
    }, 1000);

    $('#console').append(newElement).append('<br>');
  }
};

// ~~~

// inicjalzacja planszy, etc. -- tymczasowe
Logic.init();

/*
islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(FOOD_ID), 1000); // tymczasowe
islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(CLOTH_ID), 1000); // tymczasowe
islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(LIQUOR_ID), 1000); // tymczasowe
*/

// uruchomienie gry
Graphics.start();
Gui.start();
