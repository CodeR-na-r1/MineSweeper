const WIDTH = 12;
const HEIGHT = 12;
let now_cell = 0;
let field = [WIDTH * HEIGHT];

function init_field()
{
  let template_cell = document.getElementsByClassName("cell")[0];
  let cell_contain = document.getElementsByClassName("field-container")[0];

  for (let i = 2; i < (WIDTH * HEIGHT) + 1; i++) {
    let new_cell = template_cell.cloneNode(true);
    new_cell.setAttribute('data-count', i-1);
    cell_contain.appendChild(new_cell);
    if (i && i % 12 == 0)
      cell_contain.appendChild(document.createElement('br'));
  }

  now_cell = 0;
  cell_contain.children[now_cell].classList.add('markered');

  cell_contain.addEventListener('click', init_cells);

  return;
}

function init_cells(event)
{
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    if ((Math.trunc(Math.random() * 100) % 3) & 1)
      field[i] = new Object( {'isBomb': true, 'user_marker': false} );
    else
      field[i] = new Object( {'isBomb': false, 'user_marker': false} );
  }

  if (event["path"][0].getAttribute('data-count') != null)
  {
    document.getElementsByClassName("field-container")[0].removeEventListener('click', init_cells);
    let click_elem = event["path"][0];
    field[Number(click_elem.getAttribute('data-count'))].isBomb = false;
    let count = calc_bomb_around(click_elem);
    show_bomb_around(click_elem, count);

    update_marker_cell(click_elem);

    document.getElementsByClassName("field-container")[0].addEventListener('click', processing_move);
    document.getElementsByClassName("field-container")[0].addEventListener('contextmenu', mark_a_cell);
    document.addEventListener('keydown', events_keyboard);
  }

  return;
}

function processing_move(event)
{
  let event_elem;
  if (event && event['path'][0].getAttribute('data-count') != null)
  {
    event_elem = event['path'][0];
  }
  else {
    event_elem = document.getElementsByClassName("field-container")[0].children[now_cell + Math.trunc(now_cell/WIDTH)];
  }

  let num_elem = Number(event_elem.getAttribute('data-count'));

  if (event_elem.getAttribute('data-count') != null)
  {
    update_marker_cell(event_elem);

    if (field[num_elem].user_marker == true)
     return;

    if (field[num_elem].isBomb == false)
    {
      let count = calc_bomb_around(event_elem);
      show_bomb_around(event_elem, count);
    }
    else if (field[num_elem].isBomb == true)
    {
      console.log('bomb');
      document.getElementsByClassName("field-container")[0].removeEventListener('click', processing_move);
      document.getElementsByClassName("field-container")[0].removeEventListener('contextmenu', mark_a_cell);
      document.removeEventListener('keydown', events_keyboard);
      event_elem.style.backgroundImage = 'url(data_pictures/bomb.svg)';
      event_elem.style.backgroundColor = 'red';
    }
  }

  return;
}

function calc_bomb_around(event_elem)
{
  let i = Number(event_elem.getAttribute('data-count'));

  let count = 0;
  if (i % 12 != 0 && i - WIDTH - 1 > 0 && field[i - WIDTH - 1].isBomb) { ++count; }
  if (i - WIDTH > 0 && field[i - WIDTH].isBomb) { ++count; }
  if ((i+1) % 12 != 0 && i - WIDTH + 1 > 0 && field[i - WIDTH + 1].isBomb) { ++count; }

  if (i % 12 != 0 && i - 1 > 0 && field[i - 1].isBomb) { ++count; }
  if ((i+1) % 12 != 0 && i + 1 > 0 && field[i + 1].isBomb) { ++count; }

  if (i % 12 != 0 && i + WIDTH - 1 < WIDTH*HEIGHT && field[i + WIDTH - 1].isBomb) { ++count; }
  if (i + WIDTH < WIDTH*HEIGHT && field[i + WIDTH].isBomb) { ++count; }
  if ((i+1) % 12 != 0 && i + WIDTH + 1 < WIDTH*HEIGHT && field[i + WIDTH + 1].isBomb) { ++count; }

  return count;
}

function show_bomb_around(event_elem, count)
{
  let span = document.createElement('span');
  span.innerText = count;
  span.classList.add('amount_bomb_around');
  event_elem.appendChild(span);

  return;
}

function mark_a_cell(event)
{
  let cell;
  if (event && event['path'][0].getAttribute('data-count') != null)
  {
    cell = event['path'][0];
  }
  else {
      cell = document.getElementsByClassName("field-container")[0].children[now_cell + Math.trunc(now_cell/WIDTH)];
  }

  if (cell.getAttribute('data-count') != null)
  {
    if (event) event.preventDefault();
    if (field[Number(cell.getAttribute('data-count'))].user_marker)
    {
      field[Number(cell.getAttribute('data-count'))].user_marker = false;
      cell.style.backgroundImage = "";
    }
    else
      {
        field[Number(cell.getAttribute('data-count'))].user_marker = true;
        cell.style.backgroundImage = "url(data_pictures/flag.svg)";
      }
  }

  return;
}

function update_marker_cell(event_elem)
{
  let index = Math.trunc(now_cell + now_cell/WIDTH);
  event_elem.parentNode.children[index].classList.remove('markered');

  now_cell = Number(event_elem.getAttribute('data-count'));
  index = Math.trunc(now_cell + now_cell/WIDTH);
  event_elem.parentNode.children[index].classList.add('markered');

  return;
}

function events_keyboard(event)
{
  event.preventDefault();
  let elem_contain_cells = document.getElementsByClassName("field-container")[0];
  let index = Math.trunc(now_cell + now_cell/WIDTH);

  if (event.key=='ArrowLeft')
  {
    index = (index - Math.trunc(index/WIDTH)) % 12 == 0 ? index-2 : index-1;
    update_marker_cell(elem_contain_cells.children[index]);
  } else if (event.key=='ArrowRight')
  {
    index = index == (WIDTH-1 + Math.trunc((index-Math.trunc(index/WIDTH))/WIDTH)*(WIDTH+1)) ? index+2 : index+1;
    update_marker_cell(elem_contain_cells.children[index]);
  } else if (event.key=='ArrowUp')
  {
    update_marker_cell(elem_contain_cells.children[index - WIDTH - 1]);
  } else if (event.key=='ArrowDown')
  {
    update_marker_cell(elem_contain_cells.children[index + WIDTH + 1]);
  } else if (event.ctrlKey && (event.key==' '|| event.key=='Enter'))
  {
    mark_a_cell(null);
  } else if (event.key==' ' || event.key=='Enter')
  {
    processing_move(null);
  }

  console.log(event);
  return;
}

init_field();
