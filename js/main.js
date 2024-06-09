// var element = document.getElementById('mask');
// var maskOptions = {
//     mask: '+{7} (000) 000-00-00',
//     lazy: false,
// };
// var mask = IMask(element, maskOptions);

var element = document.getElementById('mask2');
var maskOptions = {
    mask: '+{7} (000) 000-00-00',
    lazy: false,
};
var mask = IMask(element, maskOptions);

var element = document.getElementById('mask3');
var maskOptions = {
    mask: '+{7} (000) 000-00-00',
    lazy: false,
};
var mask = IMask(element, maskOptions);


// Swiper
const swiper = new Swiper('.swiper', {
    slidesPerView: 2,
    spaceBetween: 60,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

let button = document.querySelector('.btn');
let popup = document.querySelector('.popup');
let close = document.querySelector('.icon-clear');

button.addEventListener("click", function () {
    popup.classList.add("active");
});
close.addEventListener("click", function () {
    popup.classList.remove("active");
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hc2snKTtcclxuLy8gdmFyIG1hc2tPcHRpb25zID0ge1xyXG4vLyAgICAgbWFzazogJyt7N30gKDAwMCkgMDAwLTAwLTAwJyxcclxuLy8gICAgIGxhenk6IGZhbHNlLFxyXG4vLyB9O1xyXG4vLyB2YXIgbWFzayA9IElNYXNrKGVsZW1lbnQsIG1hc2tPcHRpb25zKTtcclxuXHJcbnZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hc2syJyk7XHJcbnZhciBtYXNrT3B0aW9ucyA9IHtcclxuICAgIG1hc2s6ICcrezd9ICgwMDApIDAwMC0wMC0wMCcsXHJcbiAgICBsYXp5OiBmYWxzZSxcclxufTtcclxudmFyIG1hc2sgPSBJTWFzayhlbGVtZW50LCBtYXNrT3B0aW9ucyk7XHJcblxyXG52YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXNrMycpO1xyXG52YXIgbWFza09wdGlvbnMgPSB7XHJcbiAgICBtYXNrOiAnK3s3fSAoMDAwKSAwMDAtMDAtMDAnLFxyXG4gICAgbGF6eTogZmFsc2UsXHJcbn07XHJcbnZhciBtYXNrID0gSU1hc2soZWxlbWVudCwgbWFza09wdGlvbnMpO1xyXG5cclxuXHJcbi8vIFN3aXBlclxyXG5jb25zdCBzd2lwZXIgPSBuZXcgU3dpcGVyKCcuc3dpcGVyJywge1xyXG4gICAgc2xpZGVzUGVyVmlldzogMixcclxuICAgIHNwYWNlQmV0d2VlbjogNjAsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICB9LFxyXG59KTtcclxuXHJcbmxldCBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuJyk7XHJcbmxldCBwb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wb3B1cCcpO1xyXG5sZXQgY2xvc2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaWNvbi1jbGVhcicpO1xyXG5cclxuYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBwb3B1cC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG59KTtcclxuY2xvc2UuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIHBvcHVwLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbn0pO1xyXG4iXSwiZmlsZSI6Im1haW4uanMifQ==
