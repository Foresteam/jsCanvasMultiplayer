window.addEventListener('scroll', function(e) {
  const
    oldScroll = this.oldScroll || 0,
    newScroll = this.scrollY,
    isScrollDown = newScroll > oldScroll;

  document.querySelector('.hidden-menu').classList.toggle('scroll-down', isScrollDown);

  this.oldScroll = newScroll;
});
window.addEventListener('scroll', function(e) {
  const
    oldScroll = this.oldScroll || 0,
    newScroll = this.scrollY,
    isScrollDown = newScroll > oldScroll;

  document.querySelector('.btn-menu').classList.toggle('scroll-down', isScrollDown);

  this.oldScroll = newScroll;
});