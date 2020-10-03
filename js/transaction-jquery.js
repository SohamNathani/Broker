$(document).ready(function(){
    $('.myselect').select2();
    ipcRenderer.send('pageloaded','I am loaded');
    ipcRenderer.on('party-name', (event, arg)=>{
        arg.forEach(optionss => {
            var option = document.createElement('option');
            option.value = optionss.party_id;
            option.innerHTML = optionss.name;
            //console.log(option);

            //seller.appendChild(option);
            buyer.appendChild(option);
        });
        arg.forEach(optionss => {
            var option = document.createElement('option');
            option.value = optionss.party_id;
            option.innerHTML = optionss.name;
            //console.log(option);

            seller.appendChild(option);
            //buyer.appendChild(option);
        });
      last_record_fetch();  
    })
})
$('body').on('keydown', 'input, select', function(e) {
    if (e.key === "Enter") {
        var self = $(this), form = self.parents('form:eq(0)'), focusable, next;
        focusable = form.find('input,a,select,button,textarea').filter(':visible');
        next = focusable.eq(focusable.index(this)+1);
        if (next.length) {
            next.focus();
        } else {
            form.submit();
            $('#add-btn').focus();
        }
        return false;
    }
});
