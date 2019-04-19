const run = require('../src/app');

// главный файл приложения (./src/app.js) экспортирует функцию, которая возвращает новый Ractive-инстанс,
// т.е. по сути новый объект приложения. Это не слишком важно, когда код исполняется на клиенте — мы
// скорее всего не будем создавать более чем один инстанс приложения в пределах вкладки.
// Однако для исполнения кода на «stateful» nodejs-сервере крайне важно иметь возможность создавать новый объект
// приложения для каждого синхронного запроса.
module.exports = () => (req, res, next) => {

  const app = run();

  const meta = { title: 'Hello world', description: '', keywords: '' },
    // app.toHTML() — рендерит текущее состояние приложения в строку;
    content = app.toHTML(),
    // app.toCSS() — собирает все «component specific» стили, уже разбитые по неймспейсам и также возвращает их строкой
    styles = app.toCSS();

  // Далее, я уничтожаю текущий инстанс приложения вызовом метода teardown()
  app.teardown();
  // и рендерю серверный шаблон "./views/index.html" с полученными значениями, одновременно отправляя ответ.
  // Вот и весь великий и ужасный SSR.
  res.render('_index', { meta, content, styles });
};
