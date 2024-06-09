const dataTagAdder = array => {
  return array.map(el => {
    if (el.chat_icon) el.chat_icon = "data:image/png;base64," + el.chat_icon;
    if (el.user_image) el.user_image = "data:image/png;base64," + el.user_image;
    return el;
  });
};

export default dataTagAdder;
