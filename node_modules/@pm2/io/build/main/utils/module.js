"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Debug = require("debug");
const path = require("path");
const debug = Debug('axm:utils:module');
class ModuleUtils {
    static loadModule(modulePath, args) {
        let nodule;
        try {
            if (args) {
                nodule = require(modulePath).apply(this, args);
            }
            else {
                nodule = require(modulePath);
            }
            debug(`Succesfully required module at path ${modulePath}`);
            return nodule;
        }
        catch (err) {
            debug(`Failed to load module at path ${modulePath}: ${err.message}`);
            return err;
        }
    }
    static detectModule(moduleName) {
        const fakePath = ['./node_modules', '/node_modules'];
        if (!require.main) {
            return null;
        }
        const paths = typeof require.main.paths === 'undefined' ? fakePath : require.main.paths;
        const requirePaths = paths.slice();
        return ModuleUtils._lookForModule(requirePaths, moduleName);
    }
    static _lookForModule(requirePaths, moduleName) {
        const fsConstants = fs.constants || fs;
        for (let requirePath of requirePaths) {
            const completePath = path.join(requirePath, moduleName);
            debug(`Looking for module ${moduleName} in ${completePath}`);
            try {
                fs.accessSync(completePath, fsConstants.R_OK);
                debug(`Found module ${moduleName} in path ${completePath}`);
                return completePath;
            }
            catch (err) {
                debug(`module ${moduleName} not found in path ${completePath}`);
                continue;
            }
        }
        return null;
    }
}
exports.default = ModuleUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUF3QjtBQUN4QiwrQkFBOEI7QUFDOUIsNkJBQTRCO0FBRTVCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0FBRXZDLE1BQXFCLFdBQVc7SUFJOUIsTUFBTSxDQUFDLFVBQVUsQ0FBRSxVQUFrQixFQUFFLElBQWE7UUFDbEQsSUFBSSxNQUFNLENBQUE7UUFDVixJQUFJO1lBQ0YsSUFBSSxJQUFJLEVBQUU7Z0JBQ1IsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO2FBQy9DO2lCQUFNO2dCQUNMLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7YUFDN0I7WUFDRCxLQUFLLENBQUMsdUNBQXVDLFVBQVUsRUFBRSxDQUFDLENBQUE7WUFDMUQsT0FBTyxNQUFNLENBQUE7U0FDZDtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osS0FBSyxDQUFDLGlDQUFpQyxVQUFVLEtBQUssR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7WUFDcEUsT0FBTyxHQUFHLENBQUE7U0FDWDtJQUNILENBQUM7SUFLRCxNQUFNLENBQUMsWUFBWSxDQUFFLFVBQWtCO1FBQ3JDLE1BQU0sUUFBUSxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUE7UUFDcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDakIsT0FBTyxJQUFJLENBQUE7U0FDWjtRQUNELE1BQU0sS0FBSyxHQUFHLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBO1FBRXZGLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQTtRQUVsQyxPQUFPLFdBQVcsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0lBQzdELENBQUM7SUFLTyxNQUFNLENBQUMsY0FBYyxDQUFFLFlBQTJCLEVBQUUsVUFBa0I7UUFFNUUsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUE7UUFFdEMsS0FBSyxJQUFJLFdBQVcsSUFBSSxZQUFZLEVBQUU7WUFDcEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDdkQsS0FBSyxDQUFDLHNCQUFzQixVQUFVLE9BQU8sWUFBWSxFQUFFLENBQUMsQ0FBQTtZQUM1RCxJQUFJO2dCQUNGLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDN0MsS0FBSyxDQUFDLGdCQUFnQixVQUFVLFlBQVksWUFBWSxFQUFFLENBQUMsQ0FBQTtnQkFDM0QsT0FBTyxZQUFZLENBQUE7YUFDcEI7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixLQUFLLENBQUMsVUFBVSxVQUFVLHNCQUFzQixZQUFZLEVBQUUsQ0FBQyxDQUFBO2dCQUMvRCxTQUFRO2FBQ1Q7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztDQUNGO0FBeERELDhCQXdEQyJ9