/* Размеры поля */
const WIDTH = 12;
const HEIGHT = 12;
let now_cell = 0; // Номер выделеннной ячейки
let amount_open_cells = 0; // Количество открытых ячеек
let field = [WIDTH * HEIGHT];  // Массив с данными о ячейках

/* Создание поля */
function init_field()
{
  let template_cell = document.getElementsByClassName("cell")[0];  // Шаблон ячейки
  let cell_contain = document.getElementsByClassName("field-container")[0];  // Див-контейнер, в котором находятся ячейки

  for (let i = 2; i < (WIDTH * HEIGHT) + 1; i++) {  // Создание поля
    let new_cell = template_cell.cloneNode(true);  // Клонируем шаблон
    new_cell.setAttribute('data-count', i-1);  // Уникальный номер ячейки
    cell_contain.appendChild(new_cell);
    if (i && i % WIDTH == 0)  // Перенос строки
      cell_contain.appendChild(document.createElement('br'));
  }

  now_cell = 0;
  cell_contain.children[now_cell].classList.add('markered');  // По дефолту 1 ячейка является выделенной

  cell_contain.addEventListener('click', init_cells);  // Событие на нажатие (на начало игры - 1 ход)

  return;
}

/* Инициализация поля */
function init_cells(event)
{
  for (let i = 0; i < WIDTH * HEIGHT; i++) {  // Идем по полю
    if (((Math.trunc(Math.random() * 100) % 3) & 1) && ((Math.trunc(Math.random() * 100) % 3) & 1))  // Некоторая вероятность
      field[i] = new Object( {'isBomb': true, 'user_marker': false} );  // С меньшей вероятностью бомбу ставим
    else
      field[i] = new Object( {'isBomb': false, 'user_marker': false} );  // С большей вероятностью бомбу не ставим (около 8/9 %)
  }

  if (event["path"][0].getAttribute('data-count') != null)  // Если нажатие не на фон, а на ячейку
  {
    document.getElementsByClassName("field-container")[0].removeEventListener('click', init_cells);  // Убираем событие для 1 хода
    let click_elem = event["path"][0];   // Элемент, куда нажал пользователь
    field[Number(click_elem.getAttribute('data-count'))].isBomb = false;  // 1 ход - обязательно на мирную ячейку
    let count = calc_bomb_around(click_elem);  // считаем кол-во бомб вокруг нее
    show_bomb_around(click_elem, count);  // отображаем кол-во бомб вокруг нее

    update_marker_cell(click_elem);   // Метим ячейку, куда нажал пользователь
    ++amount_open_cells;  // Первая ячейка, что открыл пользователь

    // Добавляем события на нажатия левой, правой кнопки мыши и клавиатуры соответсвенно
    document.getElementsByClassName("field-container")[0].addEventListener('click', processing_move);
    document.getElementsByClassName("field-container")[0].addEventListener('contextmenu', mark_a_cell);
    document.addEventListener('keydown', events_keyboard);
  }

  return;
}

/* Ход пользователя (левой кнопкой мыши === открытие ячейки) */
function processing_move(event)
{
  let event_elem;   // Целевая ячейка
  if (event && event['path'][0].getAttribute('data-count') != null)   // Если событие с мыши - берем по событию, 2 условие проверяет, что клик не на фон, а именно на ячейку
  {
    event_elem = event['path'][0];
  }
  else {
    event_elem = document.getElementsByClassName("field-container")[0].children[now_cell + Math.trunc(now_cell/WIDTH)];   // Иначе берем по списку дочерних у общего контейнера (в индексе учитывается наличие в списке тегов переноса строки (<br>))
  }

  let num_elem = Number(event_elem.getAttribute('data-count'));   // уникальный номер ячейки

  if (event_elem.getAttribute('data-count') != null)   // Если событие точно на ячейку (а не на фон)
  {
    update_marker_cell(event_elem);   // Метим ячейку, куда нажал пользователь

    if (amount_open_cells >= WIDTH * HEIGHT)   // Если все ячейки выделены, проверяем условие выигрыша
    {
      // Проверки, что все помеченные ячейки не являются бомбами
      let flag = true;
      for (let i = 0; i < WIDTH * HEIGHT; i++)  // Идем по полю
      {
          if (field[i].user_marker && field[i].isBomb == false)
          {
            flag = false;
            break;
          }
      }
      // Удаляем поле
      if (flag)
      {
        let cell_contain = document.getElementsByClassName('field-container')[0];
        while (cell_contain.childElementCount > 0)
        {
          cell_contain.removeChild(cell_contain.children[0]);
        }
      // Поздравление о выигрыше
      cell_contain.style.height='286px';
      cell_contain.style.width='800px';
      cell_contain.style.backgroundImage = "url(data_pictures/completed.jpg)";
      // Отключаем события на нажатия левой, правой кнопки мыши и клавиатуры соответсвенно
      document.getElementsByClassName("field-container")[0].removeEventListener('click', processing_move);
      document.getElementsByClassName("field-container")[0].removeEventListener('contextmenu', mark_a_cell);
      document.removeEventListener('keydown', events_keyboard);
      return;
      }
    }

    if (field[num_elem].user_marker == true)   // Если на ней метка (флажок), то не трогаем
     return;

    if (field[num_elem].isBomb == false)   // Если не бомба
    {
      let count = calc_bomb_around(event_elem);   // Считаем, сколько бомб вокруг
      show_bomb_around(event_elem, count);   // выводим сколько бомб вокруг
      ++amount_open_cells;
    }
    else if (field[num_elem].isBomb == true)   // Если бомба
    {
      console.log('bomb');   // Отладочный рудимент
      // Отключаем события на нажатия левой, правой кнопки мыши и клавиатуры соответсвенно
      document.getElementsByClassName("field-container")[0].removeEventListener('click', processing_move);
      document.getElementsByClassName("field-container")[0].removeEventListener('contextmenu', mark_a_cell);
      document.removeEventListener('keydown', events_keyboard);
      // Добавляем изображение бомбы
      event_elem.style.backgroundImage = 'url(data_pictures/bomb.svg)';
      event_elem.style.backgroundColor = 'red';
    }
  }

  return;
}

/* Подсчет количество бомб вокруг целевой ячейки */
function calc_bomb_around(event_elem)
{
  let i = Number(event_elem.getAttribute('data-count'));   // Уникальный номер целевой ячейки

  let count = 0;   // Инициализая счетчика бомб
  /* В условиях учитывается крайнее положение ячейки */
  if (i % 12 != 0 && i - WIDTH - 1 > 0 && field[i - WIDTH - 1].isBomb) { ++count; }   // вверху слева
  if (i - WIDTH > 0 && field[i - WIDTH].isBomb) { ++count; }   // вверху
  if ((i+1) % 12 != 0 && i - WIDTH + 1 > 0 && field[i - WIDTH + 1].isBomb) { ++count; }   // вверху справа

  if ((i != 0 && i % 12 != 0) && i - 1 > 0 && field[i - 1].isBomb) { ++count; }   // слева
  if ((i+1) % 12 != 0 && i + 1 > 0 && field[i + 1].isBomb) { ++count; }   // справа

  if (i % 12 != 0 && i + WIDTH - 1 < WIDTH*HEIGHT && field[i + WIDTH - 1].isBomb) { ++count; }   // снизу слева
  if (i + WIDTH < WIDTH*HEIGHT && field[i + WIDTH].isBomb) { ++count; }   // снизу
  if ((i+1) % 12 != 0 && i + WIDTH + 1 < WIDTH*HEIGHT && field[i + WIDTH + 1].isBomb) { ++count; }   // снизу справа

  return count;
}

/* Отображние количества бомб вокруг целевой ячейки*/
function show_bomb_around(event_elem, count)
{
  let span = document.createElement('span');
  span.innerText = count;
  span.classList.add('amount_bomb_around');
  event_elem.appendChild(span);

  return;
}

/* Создание метки для ячейки (флажок) */
function mark_a_cell(event)
{
  let cell;
  if (event && event['path'][0].getAttribute('data-count') != null)   // Если событие с мыши
  {
    cell = event['path'][0];
  }
  else {   // иначе если с клавиатуры
      cell = document.getElementsByClassName("field-container")[0].children[now_cell + Math.trunc(now_cell/WIDTH)];
  }

  if (cell.getAttribute('data-count') != null)   // Если событие точно на ячейку
  {
    if (event) event.preventDefault();   // Если это событие с мыши, то отключаем появление контекстного меню
    let marker = field[Number(cell.getAttribute('data-count'))].user_marker;
    let now_cell_inner = cell.innerHTML;
    if (marker)   // Если метка уже была
    {
      --amount_open_cells;  // Вычет ячейки из общего количества открытых (обработанных) ячеек
      field[Number(cell.getAttribute('data-count'))].user_marker = false;   // меняем флаг в свойтсвах ячейки
      cell.style.backgroundImage = "";   // Убираем флаг с фона ячейки
    }
    else if (marker == false && now_cell_inner == "")   // Если метки не было
      {
        ++amount_open_cells;  // Добавление ячейки в общее количество открытых (обработанных) ячеек
        field[Number(cell.getAttribute('data-count'))].user_marker = true;   // меняем флаг в свойтсвах ячейки
        cell.style.backgroundImage = "url(data_pictures/flag.svg)";   // Ставим флаг на фон ячейки
      }
  }

  return;
}

/* Обновление показа выбранной пользователем ячейки  */
function update_marker_cell(event_elem)
{
  let index = Math.trunc(now_cell + now_cell/WIDTH);   // Находим индекс (порядковый номер среди дочерних элементов контейнера) прошлой выбранной ячейки
  event_elem.parentNode.children[index].classList.remove('markered');   // Удаляем стилизующий класс

  now_cell = Number(event_elem.getAttribute('data-count'));   // Достаем индекс (уникальный номер текущей выбранной ячейки)
  index = Math.trunc(now_cell + now_cell/WIDTH);   // Рассчитываем по индексу порядковый номер среди дочерних элементов контейнера
  event_elem.parentNode.children[index].classList.add('markered');   // Добавляем стилизующий класс

  return;
}

/* Обработка событий с клавиатуры */
function events_keyboard(event)
{
  event.preventDefault();   // Перехват события
  let elem_contain_cells = document.getElementsByClassName("field-container")[0];   // Контейнер с ячейками
  let index = Math.trunc(now_cell + now_cell/WIDTH);   // порядковый номер среди дочерних элементов контейнера

  /* У стрелок влево и вправо учитывается перенос выделения ячейки на нужную строку */
    /* + у всех стрелок учитывается наличие в массиве мешающих тегов переноса строки (<br>) */
  if (event.key=='ArrowLeft')   // Кнопка Стрелки влево
  {
    index = (index - Math.trunc(index/WIDTH)) % 12 == 0 ? index-2 : index-1;
    update_marker_cell(elem_contain_cells.children[index]);
  } else if (event.key=='ArrowRight')   // Кнопка Стрелки вправо
  {
    index = index == (WIDTH-1 + Math.trunc((index-Math.trunc(index/WIDTH))/WIDTH)*(WIDTH+1)) ? index+2 : index+1;
    update_marker_cell(elem_contain_cells.children[index]);
  } else if (event.key=='ArrowUp')   // Кнопка Стрелки вврех
  {
    update_marker_cell(elem_contain_cells.children[index - WIDTH - 1]);
  } else if (event.key=='ArrowDown')   // Кнопка Стрелки вниз
  {
    update_marker_cell(elem_contain_cells.children[index + WIDTH + 1]);
  } else if (event.ctrlKey && (event.key==' '|| event.key=='Enter'))   // Кнопка пробел или enter с зажатым ctrl
  {
    mark_a_cell(null);
  } else if (event.key==' ' || event.key=='Enter')   // Кнопка пробел или enter
  {
    processing_move(null);
  }

  console.log(event);
  return;
}

init_field(); // Запуск функции создания поля
