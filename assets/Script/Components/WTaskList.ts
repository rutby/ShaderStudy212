export type WProgressor = (p: number) => void;
export type WRunner = (task: WTask, progress: WProgressor) => Promise<boolean>;

export class WTask {
    name: string;
    weight: number;
    runner: WRunner;

    constructor(name: string, weight: number, runner: WRunner) {
        this.name = name;
        this.weight = weight;
        this.runner = runner;
    }
}

export class WTaskList {
    private _tasks: WTask[] = [];
    private _totalWeight: number = 0;
    private _debug: boolean = false;
    private _name: string = '';

    constructor(name?: string, debug?: boolean) {
        this._name = name;
        this._debug = debug;
    }

    public add(name: string, weight: number, runner: WRunner) {
        this._tasks.push(new WTask(name, weight, runner));
        this._totalWeight += weight;
    }

    public async runSerial(progress?: WProgressor) {
        this._logTaskListStart('->');

        let weight = 0;
        let success = true;
        for (let task of this._tasks) {
            this._logTaskStart(task);
            let ret = await task.runner(task, (p) => {
                let w = weight + task.weight * p;
                let pp = w / this._totalWeight;
                progress && progress(pp);
            });
            this._logTaskComplete(task, ret);

            if (!ret) {
                success = false;
                break;
            }
            weight += task.weight;
            let pp = weight / this._totalWeight;
            progress && progress(pp);
        }

        this._logTaskListComplete(success);
        return success;
    }

    public async runParallel(progress?: WProgressor) {
        this._logTaskListStart('&');

        var weight = 0; 
        let tasks = this._tasks.map(task => {
            return new Promise(async (resolve, reject) => {
                this._logTaskStart(task);
                let ret = await task.runner(task, (p) => {
                    let w = weight + task.weight * p;
                    let pp = w / this._totalWeight;
                    progress && progress(pp);
                });
                this._logTaskComplete(task, ret);

                if (ret) {
                    weight += task.weight;
                    let pp = weight / this._totalWeight;
                    progress && progress(pp);
                }

                resolve(ret);
            });
        });

        let ret = await Promise.all(tasks);
        let success = ret.indexOf(false) == -1;

        this._logTaskListComplete(success);
        return success;
    }

    private _tsPrevTaskList: number = 0;
    private _logTaskListStart(split: string) {
        if (!this._debug) {
            return;
        }

        this._tsPrevTaskList = Date.now();
        let names = this._tasks.map(ele => ele.name);
        let desc = names.join(` ${split} `);
        console.log('[WTaskList]', `[${this._name}] 任务列表开始执行: ${desc}`);
    }

    private _logTaskListComplete(success: boolean) {
        this._debug && (success? console.log: console.warn)('[WTaskList]', `[${this._name}] 任务列表执行${success? '完成': '失败'} 耗时: ${Date.now() - this._tsPrevTaskList}ms`);
    }

    private _tsPrevTask: number = 0;
    private _logTaskStart(task: WTask) {
        this._tsPrevTask = Date.now();
    }

    private _logTaskComplete(task: WTask, success: boolean) {
        this._debug && (success? console.log: console.warn)('[WTaskList]', `[${this._name}] --> 任务${success? '完成': '失败'}: ${task.name}, 耗时: ${Date.now() - this._tsPrevTask}ms`);
    }
}

/**
 * example
 * 
    let delayPromise = (delay) => {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, delay);
        });
    }

    let task0 = new WTaskList('task0', true);
    task0.add("step1", 1, async (t, p) => {
        await delayPromise(1);
        
        return true;
    });
    task0.add("step2", 3, async (t, p) => {
        let task1 = new WTaskList('task1', true);
        task1.add("step3", 1, async (t, p) => {
            await delayPromise(1);
            
            return true;
        });
        task1.add("step4", 3, async (t, p) => {
            await delayPromise(1);
            
            return true;
        });

        await task1.runSerial();
        
        return true;
    });

    task0.runParallel((p) => {
        console.log('progress', p);
    });
 */