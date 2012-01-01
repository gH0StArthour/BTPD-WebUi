 const CGOT = 1;
 const CSIZE = 3;
 const DIR = 5;
 const NAME = 7;
 const NUM = 9;
 const IHASH = 11;
 const PCGOT = 13;
 const PCOUNT = 15;
 const PCCOUNT = 17;
 const PCSEEN = 19;
 const RATEDWN = 21;
 const RATEUP = 23;
 const SESSDWN = 25;
 const SESSUP = 27;
 const STATE = 29;
 const TOTDWN = 31;
 const TOTUP = 33;
 const TRERR = 35;
 var timed_fader_timer = 0;
 var timed_fader_obj = new Array();
 var obj_couner = 0;
 var itt_tart = 0;

 var timed_fader_time_up = function (i,max) {	 
	clearInterval(timed_fader_obj);
			if ($("#row_"+i).length < 1) {
				i++;
				timed_fader_time_up(i,max);						
			}else {
				 $("#row_" + i).animate({
					 "opacity": 1
				 }, 100,function(){
					obj_couner++;								
					 if (obj_couner>=max) {
						 return false;
					 }else{		
						i++;		
						timed_fader_time_up(i,max);				
					}
				});    
			}         
            
             
     }

 var start_timed_fader = function (i,max) {	 
         timed_fader_obj = setInterval("timed_fader_time_up(" + i + ", "+max+")", 100);
     }

 var start_torrent = function (id) {
         $.ajax({
             type: "POST",
             url: "api.php",
             dataType: "json",
             data: "cmd=start&id=" + id
         });
     }

 var stop_torrent = function (id) {
         $.ajax({
             type: "POST",
             url: "api.php",
             dataType: "json",
             data: "cmd=stop&id=" + id
         });
     }

 var delete_torrent = function (id) {
         var r = confirm("Do you really want to delete this torrent?");
         if (r) {
             $.ajax({
                 type: "POST",
                 url: "api.php",
                 data: "cmd=delete&id=" + id,
                 success: function (data) {
                     if (data["resp"].length > 0) {
                         if (data["resp"] == "ok") {
                             $("#row_" + id).fadeOut(1200);
                         } else {
                             showerror(data["resp"]);
                         }
                     }

                 }
             });
         }
     }

 request = function () {
     $.ajax({
         type: "POST",
         url: "api.php",
         dataType: "json",
         data: "cmd=list",
         ifModified: true,
         success: function (data) {
             var content;
             var sum_upspeed = 0;
             var sum_downspeed = 0;
             var sum_uploaded = sum_downloaded = sum_allsize = sum_numpeer = 0;
			var max = data.length;
             for (var i = 0; i < data.length; i++) {
                 
                     timed_fader_timer = i;
                 
                 var szoveg = data[i];
                 var title = szoveg[NAME];
                 var id = szoveg[0];

                 if ($("tr#row_" + szoveg[NUM]).length == 0) {
                     var row = $("<tr id=\"row_" + szoveg[NUM] + "\">");
						if (row.css("opacity")>0) {
							row.css("opacity", 0);
							if (i==0) {
								timed_fader_obj = setInterval("timed_fader_time_up(0, "+max+")", 200);
							}
							
						}
                     if ($("#summary").length == 1) {
                         $("#summary").before(row);
                     } else {
                         $("#torrent_lista").append(row);
                     }
                 } else {
                     var row = $("#row_" + szoveg[NUM]);
                 }
                 var procent = (szoveg[CGOT] / szoveg[CSIZE]) * 100;
                 procent = Math.round(procent) + "%";

                 var row_html = "<td class=\"torrent_name\">";
                 row_html += "<small>(" + lpad(procent, ' ', 4) + ")</small> " + szoveg[7];
                 row_html += "</td>";


                 /*	state	*/
                 row_html += "<td class=\"torrent_state\">";
                 row_html += state(szoveg[STATE]);
                 row_html += "</td>";


                 row_html += "<td class=\"torrent_speed down\">";
                 row_html += bytesToSize(szoveg[RATEDWN], 2, true);
                 row_html += "</td>";

                 row_html += "<td class=\"torrent_speed up\">";
                 row_html += bytesToSize(szoveg[RATEUP], 2, true);
                 row_html += "</td>";

                 row_html += "<td class=\"torrent_peers\">";
                 row_html += (szoveg[PCOUNT] == 0 ? "" : szoveg[PCOUNT]);
                 row_html += "</td>";

                 row_html += "<td class=\"size\">";
                 row_html += bytesToSize(szoveg[TOTDWN], 2);
                 row_html += "</td>";
                 row_html += "<td class=\"size\">";
                 row_html += bytesToSize(szoveg[TOTUP], 2);
                 row_html += "</td>";
                 row_html += "<td class=\"size\">";
                 row_html += bytesToSize(szoveg[CSIZE], 2);
                 row_html += "</td>";


                 /*	controls	*/
                 row_html += "<td class=\"torrent_control\">";
                 switch (szoveg[STATE]) {
                 case 0:
                 case 2:
                     row_html += "[<span class=\"control-start\" onclick=\"start_torrent(" + szoveg[NUM] + "); return false;\">START</span>]";
                     break;
                 default:
                     row_html += "[<span class=\"control-stop\" onclick=\"stop_torrent(" + szoveg[NUM] + "); return false;\">STOP</span>]";
                     break;
                 }
                 row_html += " [<span class=\"control-delete\" onclick=\"delete_torrent(" + szoveg[NUM] + "); return false;\">DELETE</span>]";
                 row_html += "</td>";



                 row.html(row_html);
                 sum_upspeed += szoveg[RATEUP];
                 sum_downspeed += szoveg[RATEDWN];
                 sum_downloaded += szoveg[TOTDWN];
                 sum_uploaded += szoveg[TOTUP];
                 sum_allsize += szoveg[CSIZE];
                 sum_numpeer += szoveg[PCOUNT];

             }
             document.title = "BTPD webui - U: " + bytesToSize(sum_upspeed, 0, true) + " D: " + bytesToSize(sum_downspeed, 0, true);
             var html = "<td colspan=\"2\" class=\"torrent_name\">Summary: </td>" + "<td class=\"torrent_speed down\">" + bytesToSize(sum_downspeed, 2, true) + "</td>" + "<td class=\"torrent_speed up\">" + bytesToSize(sum_upspeed, 2, true) + "</td>" + "<td class=\"size\">" + sum_numpeer + "</td>" + "<td class=\"size\">" + bytesToSize(sum_downloaded, 2) + "</td>" + "<td class=\"size\">" + bytesToSize(sum_uploaded, 2) + "</td>" + "<td class=\"size\">" + bytesToSize(sum_allsize, 2) + "</td>" + "<td></td>";


             if ($("#summary").length < 1) {
                 var sum_row = $("<tr id=\"summary\">");
                 $("#torrent_lista").append(sum_row);
             } else {
                 var sum_row = $("#summary");
             }
             sum_row.html(html);

         }
     });
 }
 var space_req = function () {
         $.ajax({
             url: "api.php",
             data: "cmd=space",
             dataType: "json",
             type: "POST",
             ifModified: true,
             success: function (data) {

                 var bgcolor = '#BFBFBF'; //gray
                 var fgcolor = '#fff';
                 var used = data["usedp"];
                 if (used >= 75) {
                     bgcolor = '#00D021'; //green
                     fgcolor = '#000000'
                 }

                 if (used > 50 && used < 75) {
                     bgcolor = '#9BE384'; //light green
                     fgcolor = '#000000'
                 }
                 if (used < 50 && used > 25) {
                     bgcolor = '#DEE23E'; //yellow
                     fgcolor = '#000000'
                 }
                 if (used < 25) {
                     bgcolor = '#FF3B3E'; //red
                     fgcolor = '#fff'
                 }



                 var allstring = "Free: " + bytesToSize(data["free"], 2) + " <small>(" + Math.round(used) + "%)</small> Used: " + bytesToSize(data["used"], 2) + " Total: " + bytesToSize(data["total"], 2);
                 $(".meter-text").html(allstring);
                 $(".meter-text").css("color",fgcolor);
                 $(".meter-value").css("backgroundColor", bgcolor);
                 $(".meter-value").animate({
                     "width": used + "%"
                 }, 1000);


             }

         });
     }
 $(document).ready(function () {
     var li = $("#0");
     li.html("#a semmi");

     var list_interval = setInterval(request, 1000);
     var space_interval = setInterval(space_req, 5000);

 });