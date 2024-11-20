import { WTaskList } from "./WTaskList";

//================================================ 
const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
export default class WTaskListTest extends cc.Component {
    protected onLoad(): void {
        this.startLoading();
    }

    async startLoading() {
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
            console.log('[develop]', 'progress', p);
        });
    }
}
