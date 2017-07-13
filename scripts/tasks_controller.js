/* eslint-disable */

var DEFAULT_CONTROLLER_CONFIG = {
  loopDelay: 100,
  runOverPriority: 0.5,
};

var DEFAULT_TASK_CONFIG = {
  priority: 5,
  delay: 50,
  times: 1, // 0 means no limit
};

var UiParameters = {

};

function Task(func, config, order) {
  this.createTime = Date.now();
  this.taskOrder = order;
  this.runTimes = 0;

  this.func = func;
  this.config = config || {};
  this.taskName = this.config.taskName || ('task_' + this.taskOrder);
  this.priority = this.config.priority || DEFAULT_TASK_CONFIG.priority;
  this.delay = this.config.delay || DEFAULT_TASK_CONFIG.delay;
  this.maxRunTimes = this.config.times || DEFAULT_TASK_CONFIG.times;
}

Task.prototype.run = function () {
  this.runTimes++;
  this.func();
  return this.runTimes == this.maxRunTimes; // remove task?
}

function TaskController(config) {
  this.runOverPriority = config.runOverPriority || DEFAULT_CONTROLLER_CONFIG.runOverPriority;
  this.loopDelay = config.loopDelay || DEFAULT_CONTROLLER_CONFIG.loopDelay;

  this.isRunning = false;
  this.tasks = [];
  this.taskOrder = 0;
  this.taskRunOrder = 0;
}

TaskController.prototype.loop = function() {
  console.log('loop start');
  while(this.isRunning) {
    if (this.tasks.length != 0) {
      this.tasks.sort(function(a, b) {
        var ap = a.priority + (this.taskRunOrder - a.taskOrder) * this.runOverPriority;
        var bp = b.priority + (this.taskRunOrder - b.taskOrder) * this.runOverPriority;
        // console.log(a.taskName, ap, this.taskRunOrder - a.taskOrder, 'b',bp, this.taskRunOrder - b.taskOrder);
        return ap < bp;
      }.bind(this)); // desc
      var task = this.tasks.shift();
      sleep(task.delay);
      var isRemove = task.run();
      if (!isRemove) {
        task.taskOrder = this.taskRunOrder;
        this.tasks.push(task);
      }
      this.taskRunOrder++;
    }
    sleep(this.loopDelay);
  }
  console.log('loop stop');
};

TaskController.prototype.addTask = function (func, config) {
  this.tasks.push(new Task(func, config, this.taskOrder++));
}

TaskController.prototype.start = function () {
  this.isRunning = true;
  this.loop();
}

TaskController.prototype.stop = function () {
  this.isRunning = false;
}

var gTaskController = new TaskController(DEFAULT_CONTROLLER_CONFIG);

function printTaskStatus() {
  console.log(JSON.stringify(gTaskController));
}

gTaskController.start();