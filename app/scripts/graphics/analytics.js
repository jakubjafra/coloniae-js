/*

alalytic.js

*/

define(['../logic'], function () {
  TYPE_OK = -1;
  TYPE_NEED = 0;
  TYPE_DEMAND = 1;

  function State(productId, msg, type) {
    this.productId = productId;
    this.type = type;

    this.timeSinceLastCall = 0;
  }

  // indeksowanie: [StatesCount * island.id + State.type]
  var states = {};

  function getState(islandId, productId) {
    return states[goods.length * islandId + productId];
  }

  function setState(islandId, productId, type) {
    var state;
    if ((state = getState(islandId, productId)) == undefined)
      states[goods.length * islandId + productId] = new State(productId, type);
    else state.type = type;
  }

  function isSomethingMissingInPlayerHouses() {
    for (var islandId in islands) {
      var island = islands[islandId];
      if (island.houseGroups[0] == undefined) continue;

      // Sprawdza się dostępność wszystkich dóbr.
      for (var i = 0; i < goods.length; i++) {
        var productId = goods[i];

        var type = TYPE_OK;

        // Przegląda się listę grup od tej najbogatszej - oni zawsze mają
        // dostęp do większej ilości produktów. Ci biedniejsi będą go więc mieć
        // automatycznie mniej do podziału - czyli wygenerują jakąś akcję.
        for (var j = island.houseGroups[0].length - 1; j >= 0; j--) {
          // <- index=0 is player index
          var houseGroup = island.houseGroups[0][j];

          if (houseGroup.totalNumberOfPeople == 0) continue;

          // Gdyby arystokraci potrzebowali płótna (CLOTH_ID) można by przy pierwszym
          // undefiend wyjść z tej pętlni, ale potrzebują więc trzeba kontynuować.
          if (houseGroup.consumption[productId] == undefined) continue;

          var breakFor = false;

          switch (typeof houseGroup.consumption[productId]) {
            case 'number':
              // Jeśli jakaś grupa jest niezadowolona z ilości dostawanego towaru
              // to wygeneruj wiadomość o tym. Przerwij wykonywanie pętli bo ci "niżej"
              // będa tak samo niezadowoleni - bo są biedniejsi ;)
              if (houseGroup.contentByConsumption[productId] < 1) {
                type = TYPE_NEED;
                breakFor = true;
              }
              break;

            case 'boolean':
              // Jeśli nie ma surowca do levelupa to wygeneruj monit. I przerwij wykonywanie
              // bo (patrz tabelka wymagań) "poniżej" na pewno nikt nie będzie ich potrzebował.
              if (houseGroup.contentByConsumption[productId] < 1) {
                type = TYPE_DEMAND;
                breakFor = true;
              }
              break;

            default:
              console.error('incorect type');
          }

          if (breakFor) break;
        }

        setState(island.id, productId, type);
      }
    }
  }

  return {
    update: function (delta) {
      isSomethingMissingInPlayerHouses();

      for (var stateId in states) {
        var state = states[stateId];

        if (state.type == TYPE_OK) continue;

        state.timeSinceLastCall += delta;

        if (state.timeSinceLastCall >= 10) {
          switch (state.type) {
            case TYPE_NEED:
              if (state.productId == FOOD_ID) console.log('Your people are starving!');
              else console.log('There is not enought ' + products[state.productId].name + '!');
              break;

            case TYPE_DEMAND:
              console.log('You should provide ' + products[state.productId].name + '.');
              break;

            default:
              break;
          }

          state.timeSinceLastCall = 0;
        }
      }
    },
  };
});
