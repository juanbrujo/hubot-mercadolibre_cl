// Description:
//   Get available products from MercadoLibre.cl
//
//  Dependencies:
//    cheerio
//
// Commands:
//   hubot mercadolibre|meli|ml [product name]
//
// Author:
//   @juanbrujo

var cheerio = require('cheerio');

module.exports = function (robot) {
  robot.respond(/(mercadolibre|meli|ml) (.*)/i, function (msg) {
    msg.send(':mag: buscando...');

    var search = msg.match[2];
    var mainUrl = 'https://listado.mercadolibre.cl/';
    var url = mainUrl + search.replace(/\s+/g, '-');

    msg.robot.http(url).get()(function (err, res, body) {
      var $ = cheerio.load(body);
      var resultados = [];
      var errorText = $('main .nav-main-content .ml-main .zrp-box .header__title');

      if ( errorText.length ) {

        var notFound = errorText.text().trim();
        msg.send('No hay publicaciones que coincidan con tu búsqueda. Intenta con otro producto.');

      } else {

        $('#searchResults .results-item').each(function () {
          var title = $(this).find('.list-view-item-title a').text();
          var link = $(this).find('.list-view-item-title a').attr('href');
          var price = $(this).find('.price-info .price-info-cost .ch-price').text();
          resultados.push( '<' + link + '|' + title + ': ' + price + '>' );
       });

        if (resultados.length > 0) {

          var limiteResultados = (resultados.length > 6) ? 5 : resultados.length;
          var plural = resultados.length > 1 ? ['n','s'] : ['',''];
          var text = 'Se ha'+plural[0]+' encontrado '+ resultados.length + ' resultado'+plural[1] + '\n';
          
          for (var i=0; i < limiteResultados; i++) {
            var conteo = i + 1;
            text += conteo + ': ' + resultados[i] + '\n';
          }

          if (resultados.length > limiteResultados) {
            text += 'Otros resultados en: *<'+ url + '|MercadoLibre Chile>*\n';
          }

          if (robot.adapter.constructor.name === 'SlackBot') {
            var options = {unfurl_links: false, as_user: true};
            robot.adapter.client.web.chat.postMessage(msg.message.room, text, options);
          } else {
            msg.send(text);
          }

        }
      }

    });
  });
};
