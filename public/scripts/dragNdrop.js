const drag = function(ev) {
  console.log('were on the move');
  ev.dataTransfer.setData("text", ev.target.id);
};

const allowDrop = function(ev) {
  ev.preventDefault();
};


const moveToDo = function(ev) {
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data));
  let cat = document.getElementById('category');
  cat.innerHTML = '2';
};
