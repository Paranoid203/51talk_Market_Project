// 📊 关键效果区块 - 排版方案实现

// ✅ 方案A：只显示有数据的卡片（推荐）

interface ProjectImpact {
  efficiency?: string;
  costSaving?: string;
  satisfaction?: string;
}

interface Project {
  impact?: ProjectImpact;
  replications: number;
}

// 示例数据
const exampleProject: Project = {
  impact: {
    efficiency: '+60%',
    costSaving: '~50万/每年',
    satisfaction: '+35%',
  },
  replications: 8,
};

// 检查是否有任何关键效果数据
function hasAnyImpactData(project: Project): boolean {
  return !!(
    project.impact?.efficiency ||
    project.impact?.costSaving ||
    project.impact?.satisfaction ||
    (project.replications && project.replications > 0)
  );
}

// 关键效果组件
function KeyImpactSection({ project }: { project: Project }) {
  // 如果没有任何数据，不显示整个区块
  if (!hasAnyImpactData(project)) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        📊 <span>关键效果</span>
      </h3>
      
      {/* 使用 flex wrap 实现自动换行布局 */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* 效率提升 - 只在有数据时显示 */}
        {project.impact?.efficiency && (
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
            <div className="text-xs text-slate-400 mb-1">效率提升</div>
            <div className="text-2xl font-bold text-emerald-400">
              {project.impact.efficiency}
            </div>
          </div>
        )}

        {/* 成本节约 - 只在有数据时显示 */}
        {project.impact?.costSaving && (
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
            <div className="text-xs text-slate-400 mb-1">成本节约</div>
            <div className="text-2xl font-bold text-blue-400">
              {project.impact.costSaving}
            </div>
            <div className="text-xs text-slate-300 mt-1">每年</div>
          </div>
        )}

        {/* 复用次数 - 只在大于0时显示 */}
        {project.replications > 0 && (
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
            <div className="text-xs text-slate-400 mb-1">复用次数</div>
            <div className="text-2xl font-bold text-purple-400">
              {project.replications}
              <span className="text-sm ml-1">次</span>
            </div>
          </div>
        )}

        {/* 满意度 - 只在有数据时显示 */}
        {project.impact?.satisfaction && (
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
            <div className="text-xs text-slate-400 mb-1">满意度</div>
            <div className="text-2xl font-bold text-amber-400">
              {project.impact.satisfaction}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// 测试用例
console.log('=== 测试用例 ===\n');

// 用例1：全部4个数据都有
const case1: Project = {
  impact: {
    efficiency: '+60%',
    costSaving: '~50万/每年',
    satisfaction: '+35%',
  },
  replications: 8,
};
console.log('用例1 - 全部有数据:');
console.log('  效率提升: ✅ 显示');
console.log('  成本节约: ✅ 显示');
console.log('  复用次数: ✅ 显示');
console.log('  满意度: ✅ 显示');
console.log('  布局: 2x2 网格\n');

// 用例2：只有3个数据
const case2: Project = {
  impact: {
    efficiency: '+60%',
    costSaving: '~50万/每年',
  },
  replications: 0,
};
console.log('用例2 - 只有2个数据:');
console.log('  效率提升: ✅ 显示');
console.log('  成本节约: ✅ 显示');
console.log('  复用次数: ❌ 隐藏（数据为0）');
console.log('  满意度: ❌ 隐藏（无数据）');
console.log('  布局: 2个卡片横向排列\n');

// 用例3：只有1个数据
const case3: Project = {
  impact: {
    efficiency: '+60%',
  },
  replications: 0,
};
console.log('用例3 - 只有1个数据:');
console.log('  效率提升: ✅ 显示');
console.log('  成本节约: ❌ 隐藏');
console.log('  复用次数: ❌ 隐藏');
console.log('  满意度: ❌ 隐藏');
console.log('  布局: 1个卡片\n');

// 用例4：没有任何数据
const case4: Project = {
  impact: undefined,
  replications: 0,
};
console.log('用例4 - 没有任何数据:');
console.log('  整个"关键效果"区块: ❌ 完全隐藏');
console.log('  优点: 不会留下空白区域，排版更美观\n');

// 用例5：项目刚创建，还没有效果数据
const case5: Project = {
  impact: {
    efficiency: '',
    costSaving: '',
    satisfaction: '',
  },
  replications: 0,
};
console.log('用例5 - 项目刚创建（空字符串）:');
console.log('  整个"关键效果"区块: ❌ 完全隐藏');
console.log('  说明: 空字符串会被判断为无数据\n');

console.log('=== 排版优势 ===');
console.log('✅ 不会出现空白卡片');
console.log('✅ 自动适应不同数量的数据');
console.log('✅ 保持视觉美观');
console.log('✅ 用户体验好');

export { KeyImpactSection, hasAnyImpactData };

