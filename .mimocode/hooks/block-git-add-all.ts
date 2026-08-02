/**
 * block-git-add-all hook
 * 
 * 阻止 git add -A / git add . / git add --all 暂存 node_modules
 * 之前踩过的坑：git add -A 把整个 node_modules 暂存了，导致巨型 commit
 */
export default {
  "tool.execute.before": async (input, output) => {
    if (input.tool !== 'bash') return;

    const cmd = output.args?.command || '';
    
    // 检测 git add -A / git add . / git add --all
    const isAddAll = /git\s+add\s+(-A|--all|\.\s)/.test(cmd);
    
    if (isAddAll) {
      // 改写为只暂存项目源代码，排除危险目录
      output.args.command = cmd.replace(
        /git\s+add\s+(-A|--all|\.\s)/,
        'git add tgws/src/ tgws/e2e/ tgws/scripts/ tgws/next.config.ts tgws/vercel.json tgws/package.json tgws/package-lock.json'
      );
      output.output = (output.output || '') + '\n⚠️ Intercepted git add -A → replaced with targeted add to avoid staging node_modules';
    }
  },
};
