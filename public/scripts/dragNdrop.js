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
  console.log('data-->', data);
  console.log('ev.target-->', ev.target);
  // ev.target.appendChild(document.getElementById(data));
  let target = document.getElementById('toBuy');
  console.log('my target-->', target);
  target.appendChild(document.getElementById(data));
  console.log("we have dropped");
  // let cat = document.getElementById('category');
  // cat.innerHTML = '2';
};

