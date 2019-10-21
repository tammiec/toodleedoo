

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
  console.log('id IS-->', id);
  if (elem === 'div') {
    target.firstElementChild.appendChild(document.getElementById(data));
    console.log('THE CHILD', target.firstElementChild);
    key = target.firstElementChild.id;
    console.log('key-->', key);
  } else if (elem === 'li') {
    target.parentNode.appendChild(document.getElementById(data));
    console.log('THE PARENT', target.parentNode);

    key = target.parentNode.id;
    console.log('key-->', key);

  } else {
    target.appendChild(document.getElementById(data));
    console.log('THE TARGET', target);

    key = target.id;
    console.log('key-->', key);

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


