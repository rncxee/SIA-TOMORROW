let calDate = new Date();
let calendarEvents = [];
let selectedDate = today();

shell('Calendar','View watering tasks, expected harvests, and completed harvests by date.',`
<section class="card calendar-card">
  <div class="calendar-toolbar">
    <button class="today-btn" onclick="goToday()">Today</button>
    <div class="month-nav">
      <button onclick="moveMonth(-1)" aria-label="Previous month">‹</button>
      <h2 id="monthTitle"></h2>
      <button onclick="moveMonth(1)" aria-label="Next month">›</button>
    </div>
  </div>
  <div id="calNotice"></div>
  <p class="calendar-help">Click a date to view the tasks scheduled for that day.</p>
  <div class="calendar-grid" id="calendar"></div>
  <div class="legend">
    <span><i class="dot watering-dot"></i>Watering task</span>
    <span><i class="dot expected-dot"></i>Expected harvest</span>
    <span><i class="dot harvest-dot"></i>Completed harvest</span>
  </div>
</section>

<section class="card day-tasks-card" id="dayTasksCard">
  <div class="day-tasks-header">
    <div>
      <h2 id="selectedDateTitle">Tasks for today</h2>
      <p id="selectedDateSubtitle">Select a date on the calendar to view its checklist.</p>
    </div>
    <span class="task-count" id="taskCount">0 tasks</span>
  </div>
  <div id="dayTasks"></div>
</section>
`);

function moveMonth(n){
  calDate.setMonth(calDate.getMonth()+n);
  loadCal();
}

function goToday(){
  calDate = new Date();
  selectedDate = today();
  loadCal();
}

async function loadCal(){
  const y=calDate.getFullYear(), m=calDate.getMonth()+1;
  try{
    const d=await api(`get_calendar.php?year=${y}&month=${m}`);
    calendarEvents=d.events || [];
    document.getElementById('monthTitle').textContent=new Date(y,m-1,1).toLocaleString('en-US',{month:'long',year:'numeric'});
    document.getElementById('calNotice').innerHTML='';

    const first=new Date(y,m-1,1).getDay();
    const days=new Date(y,m,0).getDate();
    const prev=new Date(y,m-1,0).getDate();
    let cells='';

    for(let i=0;i<42;i++){
      let day=i-first+1;
      let cellYear=y;
      let cellMonth=m;
      let cur=true;

      if(day<1){
        day=prev+day;
        cur=false;
        cellMonth=m-1;
        if(cellMonth===0){cellMonth=12;cellYear=y-1;}
      }else if(day>days){
        day-=days;
        cur=false;
        cellMonth=m+1;
        if(cellMonth===13){cellMonth=1;cellYear=y+1;}
      }

      const date=`${cellYear}-${String(cellMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const ev=calendarEvents.filter(e=>e.date===date);
      const isToday=date===today();
      const isSelected=date===selectedDate;

      cells+=`<button type="button" class="day ${cur?'':'other'} ${isToday?'today':''} ${isSelected?'selected':''}" onclick="selectDate('${date}')" aria-label="${date}">
        <span class="day-number">${isToday?`<b>${day}</b>`:day}</span>
        <span class="day-events">${ev.map(e=>`<span class="event ${e.type} ${Number(e.done)===1?'completed':''}" title="${esc(e.title)}">${esc(e.title)}</span>`).join('')}</span>
      </button>`;
    }

    document.getElementById('calendar').innerHTML=
      ['SUN','MON','TUE','WED','THU','FRI','SAT'].map(x=>`<div class="weekday">${x}</div>`).join('')+cells;

    renderDayTasks(selectedDate);
  }catch(e){
    document.getElementById('calNotice').innerHTML=`<div class="error-box">${esc(e.message)}</div>`;
    renderDayTasks(selectedDate);
  }
}

function selectDate(date){
  selectedDate=date;
  const parts=date.split('-').map(Number);
  const targetMonth=parts[1]-1;
  if(calDate.getFullYear()!==parts[0] || calDate.getMonth()!==targetMonth){
    calDate=new Date(parts[0],targetMonth,1);
    loadCal();
    return;
  }
  document.querySelectorAll('.day.selected').forEach(el=>el.classList.remove('selected'));
  const dayButtons=document.querySelectorAll('.day');
  dayButtons.forEach(btn=>{
    if(btn.getAttribute('aria-label')===date) btn.classList.add('selected');
  });
  renderDayTasks(date);
  document.getElementById('dayTasksCard')?.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function renderDayTasks(date){
  const title=document.getElementById('selectedDateTitle');
  const subtitle=document.getElementById('selectedDateSubtitle');
  const list=document.getElementById('dayTasks');
  const count=document.getElementById('taskCount');
  if(!title||!subtitle||!list||!count)return;

  const d=new Date(`${date}T00:00:00`);
  const pretty=d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const events=calendarEvents.filter(e=>e.date===date);
  const tasks=events.filter(e=>e.type==='watering');
  const info=events.filter(e=>e.type!=='watering');
  const remaining=tasks.filter(e=>Number(e.done)!==1).length;

  title.textContent=`Tasks for ${pretty}`;
  subtitle.textContent=tasks.length ? `${remaining} watering task${remaining===1?'':'s'} remaining` : 'No watering tasks scheduled for this day.';
  count.textContent=`${tasks.length} task${tasks.length===1?'':'s'}`;

  let html='';
  if(tasks.length){
    html += `<div class="checklist">${tasks.map(task=>`
      <label class="checklist-item ${Number(task.done)===1?'checked':''}">
        <input type="checkbox" ${Number(task.done)===1?'checked':''} onchange="toggleWateringTask(${task.id}, this.checked)">
        <span class="checkmark"></span>
        <span class="checklist-main">
          <strong>${esc(task.title)}</strong>
          <small>${esc(task.crop_type || 'Crop')}</small>
        </span>
        <span class="checklist-status">${Number(task.done)===1?'Completed':'Pending'}</span>
      </label>`).join('')}</div>`;
  } else {
    html += `<div class="empty checklist-empty"><span class="empty-icon">✓</span><div><strong>Nothing to check off.</strong><span>Add a watering task from the Watering Tasks page.</span></div></div>`;
  }

  if(info.length){
    html += `<div class="day-events-summary"><h3>Other scheduled events</h3>${info.map(e=>`
      <div class="scheduled-event ${e.type}"><span>${esc(e.title)}</span><small>${e.type==='expected'?'Expected harvest':'Harvest recorded'}</small></div>`).join('')}</div>`;
  }

  list.innerHTML=html;
}

async function toggleWateringTask(id, done){
  try{
    const result=await post('mark_done.php',{id,done:done?1:0});
    const event=calendarEvents.find(e=>Number(e.id)===Number(id) && e.type==='watering');
    if(event)event.done=done?1:0;
    renderDayTasks(selectedDate);
    loadCal();
    toast(result.message || 'Task updated.');
  }catch(e){
    toast(e.message,true);
    renderDayTasks(selectedDate);
  }
}

loadCal();
