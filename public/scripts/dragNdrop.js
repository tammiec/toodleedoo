

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
  // console.log('data-->', data);
  // console.log('ev.target-->', ev.target);
  // ev.target.appendChild(document.getElementById(data));
  addToUl(ev.target, data);
  // target.appendChild(document.getElementById(data));
  console.log("we have dropped");
  // let cat = document.getElementById('category');
  // cat.innerHTML = '2';
};

const addToUl = function(target, data) {
  //target.localName
  //target.parentNode
  //target.firstElementChild
  let elem = target.localName;
  let key;
  let id = data.split('-')[1];
  if (elem === 'div') {
    target.firstElementChild.appendChild(document.getElementById(data));
    key = target.firstElementChild.id;
  } else if (elem === 'li') {
    target.parentNode.appendChild(document.getElementById(data));
    key = target.parentNode.id;
  } else {
    target.appendChild(document.getElementById(data));
    key = target.id;
  }
  sendAJAX(key, id);
};

const sendAJAX = async(key, id) => {
  try {
    await $.ajax(`/todo/update?catKey=${key}&taskId=${id}`, { method: 'PUT'});
  } catch (err) {
    console.error(err);
  }
  console.log("we've sent the request");
};


