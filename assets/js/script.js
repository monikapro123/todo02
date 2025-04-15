
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-toggle");
    const closeSidebar = document.getElementById("close-sidebar");
    const sidebar = document.getElementById("sidebar");

    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("-translate-x-full");
    });

    closeSidebar.addEventListener("click", () => {
        sidebar.classList.add("-translate-x-full");
    });


    // fetchDefaultList();
    // fetchlist();
    fetchTasks();
    countTasks();

});
$(document).on("click", ".listtasks", function (e) {
    let id = $(this).attr("data-id");
    // alert(id);
    // return false;
    $(".listtasks").removeClass("active-list");
    $(this).addClass("active-list");
    let activeListId = $(".active-list").attr("data-id")

    if (activeListId == "important") {
        $(".hideComp").addClass("hidden")

    } else {
        $(".hideComp").removeClass("hidden")

    }
    fetchTasks(id);
})

$(document).on("click", "#togglecomp", function () {
    if ($(".arrowRight").hasClass("hidden")) {
        $(".arrowRight").removeClass("hidden");
        $(".arrowDown").addClass("hidden");
    }
    else {
        $(".arrowRight").addClass("hidden");
        $(".arrowDown").removeClass("hidden");
    }
})
//counts
function countTasks() {
    let countOfComp = 0;
    let countOfImp=0;
    let countOfmyday=0;
    $.ajax({
        url: "./config/server.php",
        type: "POST",
        data: {
            countTasks: true
        },
        success: function (response) {
            const res = JSON.parse(response);
            // console.log(res);
            if (res.success) {
                countOfmyday=res.myday;
                $(".mydaycount").text(countOfmyday);
                countOfComp = res.count;
                countOfImp=res.countImportant;
                $(".countimportant").text(countOfImp);
                $(".countComp").text(countOfComp);
                $(".completed").text(countOfComp);
            }
        },
        error: function (response) {
            console.log(response);
        }
    })

}

$(document).on("click", "#addtask", function (e) {
    e.preventDefault();

    let form = $("#taskform1");
    let url = form.attr("action");
    let method = form.attr("method");
    let activeListId = $(".active-list").attr("data-id");
    // console.log(activeListId);

    let formData = form.serialize();
    formData += "&activeListId=" + activeListId;

    if (activeListId == "important") {
        formData += "&is_imp=1";
    } else {
        formData += "&is_imp=0";
    }

    $.ajax({
        url: url,
        method: method,
        data: formData,

        success: function (response) {
            const arr = JSON.parse(response);
            console.log(arr);
            if (arr.success) {
                $("#taskforminput").val("");
                fetchTasks(activeListId);
                countTasks();
                
            } else {
                console.log("Data not inserte");
            }
        },
        error: function (response) {
            console.log(response);
        }
    });
});


function fetchTasks(id = "") {
    let request = {
        getdata: true,

    }
    if (id != "") {
        request.id = id;
    }
    $.ajax({
        url: "./config/server.php",
        type: "POST",
        data: request,
        success: function (response) {
            const res = JSON.parse(response);
            // console.log(res);
            if (res.success) {


                let tasklist = res.tasklist;
                renderdata(tasklist);

            }
        },
        error: function (response) {
            console.log(response);
        }
    });
}
// render task data
function renderdata(data) {
    // const tasklistdata = $("#tasklist").empty();
    let html = "";
    let htmlcomp = "";
    let countchecked = '';
    data.forEach(task => {
        // console.log(task);

        let is_imp = "text-gray-300"
        if (task.is_imp == 1) {
            is_imp = "text-yellow-600";
        }
        let is_checked = "";
        if (task.is_comp == 1) {
            is_checked = "checked"

        }
        // tasklistdata.append(`<div class="flex justify-between taskitembtn rightclickmenu bg-[#1E3E62] py-2 mr-4 px-4 rounded-lg shadow mb-1 removeImp${task.id} "id="${task.id}">   
        //                         <div class="taskComp  " data-id="${task.id}" data-comp="${task.is_comp}">
        //                         <input type="checkbox" ${is_checked} class=" " >

        //                         <span id="tasksidebar" class="text-lg text-white font-semibold mb-1 ml-4">${task.task}</span>
        //                         </div>
        //                         <div class="space-x-2">
        //                             <i class="fa-solid fa-star ${is_imp} hover:text-yellow-600 isImp isImp${task.id}" data-id="${task.id}"
        //                                 data-imp="${task.is_imp}"></i>
        //                         </div>
        //                     </div>`);

        let tasks = `<div class="flex justify-between taskitembtn rightclickmenu bg-[#1E3E62] py-2 mr-4 px-4 rounded-lg shadow mb-1 removeImp${task.id} "id="${task.id}">   
                                <div class="taskComp  " data-id="${task.id}" data-comp="${task.is_comp}">
                                <input type="checkbox" ${is_checked} class=" " >
                                
                                <span id="tasksidebar" class="text-lg text-white font-semibold mb-1 ml-4">${task.task}</span>
                                </div>
                                <div class="space-x-2">
                                    <i class="fa-solid fa-star ${is_imp} hover:text-yellow-600 isImp isImp${task.id}" data-id="${task.id}"
                                        data-imp="${task.is_imp}"></i>
                                </div>
                            </div>`;

        if (task.is_comp == 1) {
            htmlcomp += tasks;
            countchecked++;
        } else {
            html += tasks;

        }

    });
    $("#tasklist").html(html);
    $("#CompTasks").html(htmlcomp);

}




$("#togglecomp").click(function () {
    $("#CompTasks").toggleClass("hidden");
})



$(document).on("click", ".taskComp", function (e) {
    e.stopPropagation();

});

$(document).on("click", ".taskComp", function (e) {
    // e.preventDefault();
    id = $(this).attr("data-id");
    comp = $(this).attr("data-comp");
    let activeListId = $(".active-list").attr("data-id");
    // console.log(activeListId)
    $.ajax({
        url: "./config/server.php",
        type: "POST",
        data: {
            updateComp: true,
            id: id,
            comp: comp
        },
        success: function (response) {

            let res = JSON.parse(response);
            if (res.success) {
                $(".removeImp" + id).remove();
                fetchTasks(activeListId);
                countTasks();
            }

            // console.log(response);
        },
        error: function (response) {
            console.log(response);
        }
    });
})

$(document).on("click", ".isImp", function (e) {
    e.stopPropagation();
})
$(document).on("click", ".isImp", function (e) {
    id = $(this).attr("data-id");
    imp = $(this).attr("data-imp");
    let activeListId = $(".active-list").data("id");

    $.ajax({
        url: "./config/server.php",
        type: "POST",
        data: {
            updateImp: true,
            id: id,
            imp: imp
        },
        success: function (response) {
            // fetchTasks();
            console.log(response);
            let res = JSON.parse(response);
            if (res.success) {
                let is_imp = "";
                
                if (imp == 0) {
                    $(".isImp" + id).removeClass("text-gray-300").addClass("text-yellow-600");
                    $(".isImp" + id).attr("data-imp", 1)
                } else {
                    if (activeListId == "important") {
                        setTimeout(() => {
                            $(".removeImp" + id).remove();
                        }, 500)
                    }
                    $(".isImp" + id).attr("data-imp", 0)
                    $(".isImp" + id).removeClass("text-yellow-600").addClass("text-gray-300");
                }
                countTasks();
            }
        },
        error: function (response) {
            console.log(response);
        }
    });
});

function getMaxOrZero(arr) {
    return arr.length ? Math.max(...arr) : 0;
};

$(document).on('click', '#addnewlistbtn', function (e) {
    // e.preventDefault();
    let allLists = $(".listspan");
    let temp_list = "untitled list";
    let list = "untitled list";
    let list_no = 1;
    if (allLists.length > 0) {
        alert("list already exist");
        console.log(allLists);
        let arrTemp = [];
        allLists.each(function () {
            let temp_list = $(this).attr("temp_list");
            let list_no = $(this).attr("list_no");
            console.log(temp_list);
            if ((temp_list.slice(0, 13)) === "untitled list") {
                arrTemp.push(list_no);
            };
        });
        let maxNo = getMaxOrZero(arrTemp);
        // console.log(maxNo)
        list_no = parseInt(maxNo) + 1;
        // let temp=parseInt(maxNo)-1;
        list = 'Untitled List (' + maxNo + ')';
        temp_list = 'Untitled List(' + maxNo + ')';

    }
    $.ajax({
        url: "./config/server.php",
        type: 'post',
        data: {
            addList: true,
            listname: list,
            listno: list_no,
            temp_list: temp_list
        },
        success: function (response) {
            const res = JSON.parse(response);
            console.log(res);
            if (res.success) {

                renderlist(res.data, 1);
            }
        },
        error: function (response) {
            console.log(response);
        },
    })
})

function fetchlist() {

    $.ajax({
        url: "./config/server.php",
        type: 'post',
        data: { getnewlist: 1 },
        success: function (response) {
            const res = JSON.parse(response);
            console.log(res);
            if (res.success) {
                renderlist(res.data, 1);
            }
        },
        error: function (response) {
            console.log(response);
        }
    })
}


// function renderlist_1(data) {
//     data.forEach(list => {
//         let html = `<li class="flex listcontextmenu list-none py-1 mr-4 px-4 rounded-lg mb-1" data-id="${list.id}">

//         <i class="fa-solid fa-bars mt-4 mr-2"></i>
//         <span class=" listspan${list.id} listSpan text-lg font-semibold mt-2 ml-4">${list.newlist}(${list.id})</span>
//         <input class="hidden listInput${list.id} listInput listInputActive bg-gray-50 border-none border-b-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-blue-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" type="text" name="list_name" value="${list.newlist}" />

//         </li>`;
//         $("#newlistdata").append(html);
//     });
// }
//render newlist
function renderlist(data, listinput = "") {
    // console.log(data);
    // const tasklistdata = ;
    // const tasklistdata = $("#tasklist").empty();
    //  html="";
    if (listinput == 1) {
        var span = "hidden";
        var input = "";
    } else {
        var span = "";
        var input = "hidden";
    }


    data.forEach(list => {
        let html = `<li class="flex listcontextmenu list-none py-1 mr-4 px-4 rounded-lg mb-1" data-id="${list.id}">
                
                <i class="fa-solid fa-bars mt-4 mr-2"></i>
                <span class="${span} listspan${list.id} listSpan text-lg font-semibold mt-2 ml-4" temp_list="${list.temp_list}" list_no="${list.list_no}">${list.list_name}</span>
                <input class="${input} listInput${list.id} listInput listInputActive bg-gray-50 border-none border-b-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-blue-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" type="text" name="list_name" value="${list.list_name}(${list.id})" />
                
                </li>`;


        $("#newlistdata").append(html);
        $(".listInput" + list.id).focus().select();
        $(".activeinput").attr("data-id", list.id);
    });
};


$(document).click(function (e) {
    if (!$(e.target).closest('.listInputActive').length) {

        let activeinput = $(".activeinput").attr("data-id");
        $('.listInput' + activeinput).addClass('hidden');
        $('.listSpan' + activeinput).removeClass('hidden');
        $(".listInput" + activeinput).focus().select();

    }
});

$(document).on('click', '.taskitembtn', function (e) {
    // e.preventDefault();
    $('.sidebar').toggle();
    let is_open = $(".main_screenspace").attr("is_open");
    if (is_open === '0') {

        $("#taskform1").removeClass("max-w-5xl");
        $("#taskform1").addClass("max-w-3xl");
        $('.main_screenspace').addClass('w-3/5');
        $('.main_screenspace').removeClass('w-full');
        $('.main_screenspace').attr('is_open', '1');
    } else {
        $("#taskform1").removeClass("max-w-3xl");
        $("#taskform1").addClass("max-w-5xl");
        $('.main_screenspace').addClass('w-full');
        $('.main_screenspace').removeClass('w-3/5');
        $('.main_screenspace').attr('is_open', '0');
    }
});

//context right click menu on task
$(document).on("contextmenu", ".rightclickmenu", function (e) {
    e.preventDefault();
    console.log("right click");
    let posX = e.pageX;
    let posY = e.pageY;

    $("#contextMenuForTask").css({ "top": posY + "px", "left": posX + "px" }).removeClass("hidden");
    $(document).on("click", function () {
        $("#contextMenuForTask").addClass("hidden");
    });
    let id = $(this).attr("id");
    $(".deletetask").attr("data-id", id);

});


$(document).on("click", ".deletetask", function (e) {
    e.preventDefault();
    let id = $(this).attr("data-id");

    $.ajax({
        url: "./config/server.php",
        type: "POST",
        data: {
            id: id,
            deletetask: true // Ensure this key matches what PHP checks for
        },
        success: function (response) {
            try {
                let res = JSON.parse(response);
                if (res.success) {

                    location.reload(); // Refresh the page to reflect changes
                } else {
                    alert("Failed to delete task.");
                }
            } catch (error) {
                console.error("Invalid JSON response:", response);
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", status, error);
        }
    });
});

$(".openpopup").on("click", function () {
    $("#deleteModal").removeClass("hidden");
});



// Cancel delete
$("#cancelDelete").on("click", function () {
    $("#deleteModal").addClass("hidden");
});

//list context menu
$(document).on("contextmenu", ".listcontextmenu", function (e) {
    e.preventDefault();
    console.log("right click");
    let posX = e.pageX;
    let posY = e.pageY;

    $("#contextMenu").css({ "top": posY + "px", "left": posX + "px" }).removeClass("hidden");
    $(document).on("click", function () {
        $("#contextMenu").addClass("hidden");
    });
    let id = $(this).attr("id");
    $(".deletelist").attr("data-id", id);

});

// function fetchDefaultList() {

//     $.ajax({
//         url: "./config/server.php",
//         type: 'post',
//         data: { getdefaultlist: true },
//         success: function (response) {
//             const res = JSON.parse(response);
//             console.log(res);
//             if (res.success) {
//                 let html = "";
//                 let i = 0;

//                 res.listData.forEach(list => {
//                     let active = "";
//                     if (i == 0) {
//                         active = "active-list";
//                     }
//                     html = `<li class="flex ${active} cursor-pointer defaultlist items-center p-2 rounded-lg listTasks" data-id=${list.id}>
//                                         ${list.list_name}
//                                      </li>`;
//                     i++;
//                     $(".default-list").append(html);
//                 });
//             }
//         },
//         error: function (response) {
//             console.log(response);
//         }
//     });
// };



// $(document).on("click", ".delete", function (e) {
//     $("#deleteModal").removeClass("hidden");

