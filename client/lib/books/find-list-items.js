export default function(itemsObj, search) {
  return Object.keys(itemsObj).filter(item => {
    return item.toLowerCase().indexOf(search) > -1;
  });
}
