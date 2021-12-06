const WIDTH = 12;
const HEIGHT = 12;
let now_cell = null;
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
    document.getElementsByClassName("field-container")[0].addEventListener('click', processing_move);
  }

  return;
}

function processing_move(event)
{
  let event_elem = event['path'][0];
  let num_elem = Number(event_elem.getAttribute('data-count'));

  if (event_elem.getAttribute('data-count') != null)
  {
    if (field[num_elem].isBomb == false)
    {
      let count = calc_bomb_around(event_elem);
      show_bomb_around(event_elem, count);
    }
    else if (field[num_elem].isBomb == true)
    {
      console.log('bomb');
      document.getElementsByClassName("field-container")[0].removeEventListener('click', processing_move);
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

  if (i % 12 != 0 && i + WIDTH - 1 > 0 && field[i + WIDTH - 1].isBomb) { ++count; }
  if (i + WIDTH > 0 && field[i + WIDTH].isBomb) { ++count; }
  if ((i+1) % 12 != 0 && i + WIDTH + 1 > 0 && field[i + WIDTH + 1].isBomb) { ++count; }

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

init_field();
