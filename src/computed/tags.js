// режде всего, нам необходимо получить список популярных тегов из API.
// Для этого сервис работающий с API уже имеет готовый вызов и осталось только написать код, который будет
// реализовывать данный запрос. Также очень важно помнить о поддержке SSR и других изоморфных штук,
// описанных в предыдущей статье.

// А сейчас интересный момент. Подобного рода запросы на получение данных я, чаще всего, реализую с помощью,
// внимание, вычисляемых свойств компонентов!
const api = require('../services/api');

module.exports = function() {

  const key = 'tagsList';
  // Кроме того, мы наконец-то воспользовались методом keychain() из плагина ractive-ready
  // Этот метод просто возвращает корректный путь внутри объекта данных, в зависимости от того на каком уровне
  // вложенности находится компонент, подключивший это вычисляемое свойство.
  const keychain = `${this.snapshot}${this.keychain()}.${key}`;

  let tags = this.get(keychain);
  if ( ! tags) {
    tags = api.tags.fetchAll().then(data => data.tags);
    this.wait(tags, key);
  }

  // Теперь подключаем данное свойство к Root компоненту, подключаем компонент Tags и передаем это свойство ему
  // в качестве аттрибута. (app.js)
  return tags;
};
