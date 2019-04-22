const run = require('../src/app');

// главный файл приложения (./src/app.js) экспортирует функцию, которая возвращает новый Ractive-инстанс,
// т.е. по сути новый объект приложения. Это не слишком важно, когда код исполняется на клиенте — мы
// скорее всего не будем создавать более чем один инстанс приложения в пределах вкладки.
// Однако для исполнения кода на «stateful» nodejs-сервере крайне важно иметь возможность создавать новый объект
// приложения для каждого синхронного запроса.
module.exports = () => (req, res, next) => {

  const app = run();
  // выставление текущего Url в роутер
  const route = app.$page.show(req.url, null, true, false);

  // оборачиваем в app.ready чтобы дождаться момента загрузки всех асинхронных данных. Нужно для реализации асинхронной
  // загрузки при SSR
  // Ready-коллбек не только позволяет подождать загрузки данных, но и получает эти данные в структурированном виде
  // в качестве второго аргумента.
  // Первый аргумент, как принято в NodeJS, это ошибка, которая может возникнуть во время данного процесса.
  app.ready((error, data) => {

    // подключение роутинга для изоморфного приложения (должен быть одинаковый роутинг для ноды и Ractive
    // теперь роутинг становится полностью изоморфным
    const meta = route.state.meta;
    // app.toHTML() — рендерит текущее состояние приложения в строку;
    const content = app.toHTML();
    // app.toCSS() — собирает все «component specific» стили, уже разбитые по неймспейсам и также возвращает их строкой
    const styles = app.toCSS();

    // Далее, я уничтожаю текущий инстанс приложения вызовом метода teardown()
    app.teardown();

    // данные, которые пришли асинхронно
    data = JSON.stringify(data || {});
    // а также месседжи ошибок, если они случились
    error = error && error.message ? error.message : error;

    // и рендерю серверный шаблон "./views/index.html" с полученными значениями, одновременно отправляя ответ.
    // Вот и весь великий и ужасный SSR.
    res.render('_index', { meta, content, styles });
  });
};
