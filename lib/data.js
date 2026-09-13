const option = (value, label) => ({ value, label });

const questions = [
  { id: 'timeline', title: '你预计什么时候开始养宠？', chapter: 'time', options: [option('soon', '3个月内'), option('later', '半年以后'), option('exploring', '还在了解')] },
  { id: 'aloneHours', title: '工作日宠物可能连续独处多久？', chapter: 'time', options: [option('short', '4小时以内'), option('medium', '4～8小时'), option('long', '8小时以上')] },
  { id: 'exercise', title: '每天能稳定提供多少户外运动时间？', chapter: 'time', options: [option('low', '30分钟以内'), option('medium', '30～90分钟'), option('high', '90分钟以上')] },
  { id: 'interaction', title: '每天愿意投入多少训练和互动时间？', chapter: 'time', options: [option('low', '20分钟以内'), option('medium', '20～60分钟'), option('high', '60分钟以上')] },
  { id: 'travel', title: '出差或旅行频率如何？', chapter: 'time', options: [option('rare', '很少'), option('sometimes', '偶尔'), option('often', '经常')] },
  { id: 'familyConsent', title: '同住成员是否都同意养宠？', chapter: 'home', help: '家庭共识是长期照护的前提。', options: [option('yes', '都同意'), option('uncertain', '还没充分讨论'), option('no', '有人明确反对')] },
  { id: 'housingPermission', title: '住所规定是否允许养宠？', chapter: 'home', options: [option('yes', '确认允许'), option('limited', '允许，但有限制'), option('unknown', '还未确认'), option('no', '明确禁止')] },
  { id: 'space', title: '当前居住空间如何？', chapter: 'home', options: [option('small', '小户型，无独立户外空间'), option('medium', '普通住宅'), option('large', '空间较大或有安全户外区域')] },
  { id: 'familyMembers', title: '家中是否有需要特别考虑的成员？', chapter: 'home', options: [option('none', '没有'), option('children', '有儿童'), option('elderly', '有老人'), option('both', '儿童和老人都有')] },
  { id: 'allergy', title: '家庭成员是否存在过敏顾虑？', chapter: 'home', options: [option('none', '没有已知顾虑'), option('unsure', '不确定，尚未接触测试'), option('yes', '有明确过敏史')] },
  { id: 'noise', title: '你对叫声和邻里影响的接受程度？', chapter: 'home', options: [option('low', '需要尽量安静'), option('medium', '可接受适度叫声'), option('high', '接受度较高')] },
  { id: 'budget', title: '每月可稳定承担的日常预算？', chapter: 'support', help: '不包含突发医疗费用。', options: [option('none', '目前无法稳定承担'), option('low', '500元以内'), option('medium', '500～1200元'), option('high', '1200元以上')] },
  { id: 'emergencyFund', title: '是否能准备突发医疗备用金？', chapter: 'support', options: [option('yes', '已经准备或可以建立'), option('later', '需要一段时间准备'), option('no', '目前无法准备')] },
  { id: 'carePlan', title: '不在家时是否有可靠照护方案？', chapter: 'support', options: [option('yes', '有可靠方案'), option('possible', '可以提前安排'), option('no', '目前没有')] },
  { id: 'preference', title: '你目前更倾向哪种宠物？', chapter: 'care', options: [option('cat', '猫'), option('dog', '狗'), option('unsure', '尚未确定')] },
  { id: 'shedding', title: '你对掉毛的接受程度？', chapter: 'care', options: [option('low', '很难接受'), option('medium', '可以定期清理'), option('high', '能够接受较多掉毛')] },
  { id: 'grooming', title: '你愿意投入多少梳毛、美容和清洁精力？', chapter: 'care', options: [option('low', '希望护理较少'), option('medium', '可定期护理'), option('high', '能接受高频护理')] },
  { id: 'temperament', title: '你更期待怎样的日常相处？', chapter: 'care', options: [option('quiet', '安静陪伴'), option('balanced', '陪伴与活动平衡'), option('active', '高互动、常活动')] }
].map((q) => ({ ...q, required: true }));

const chapters = [
  { id: 'time', number: '01', title: '时间与陪伴' },
  { id: 'home', number: '02', title: '居住与环境' },
  { id: 'support', number: '03', title: '预算与支持' },
  { id: 'care', number: '04', title: '照护与偏好' }
];

const aliases = {
  'chinese-cat': ['田园猫', '家猫'], 'british-shorthair': ['英短'], 'american-shorthair': ['美短'], ragdoll: ['布偶'], siamese: ['暹罗'],
  'maine-coon': ['缅因'], 'exotic-shorthair': ['异短', '加菲猫'], 'devon-rex': ['德文'], 'chinese-dog': ['田园犬'], poodle: ['贵宾', '泰迪'],
  bichon: ['比熊'], corgi: ['彭布罗克柯基'], 'golden-retriever': ['金毛'], labrador: ['拉布拉多'], 'border-collie': ['边牧'],
  'shiba-inu': ['柴犬'], pomeranian: ['博美'], schnauzer: ['迷你雪纳瑞'], 'french-bulldog': ['法斗'], husky: ['西伯利亚雪橇犬']
};

const breed = (id, nameZh, nameEn, species, size, activity, aloneTolerance, vocal, shedding, grooming, training, familyCompatibility, monthlyCost, dailyMinutes, suitableFor, unsuitableFor) => ({
  id, nameZh, nameEn, species, size, activity, aloneTolerance, vocal, shedding, grooming, training, familyCompatibility,
  monthlyCost, dailyMinutes, suitableFor, unsuitableFor, aliases: aliases[id] || [], image: `/images/breeds/${id}.jpg`,
  healthRisks: ['本版本不提供具体疾病风险判断；个体健康问题请咨询执业兽医']
});

const breeds = [
  breed('chinese-cat','中华田园猫','Chinese Domestic Cat','cat','medium','medium','high','low','medium','low','low','high',[350,800],[30,60],['希望日常护理相对可控的家庭'],['期待所有个体表现完全一致的家庭']),
  breed('british-shorthair','英国短毛猫','British Shorthair','cat','medium','low','high','low','high','medium','low','high',[500,1100],[30,60],['偏好安静室内陪伴'],['很难接受掉毛']),
  breed('ragdoll','布偶猫','Ragdoll','cat','large','low','medium','low','high','high','low','high',[700,1500],[45,75],['能稳定梳毛并重视室内安全'],['预算或护理时间有限']),
  breed('siamese','暹罗猫','Siamese','cat','medium','high','low','high','low','low','medium','medium',[500,1100],[60,90],['喜欢互动且在家时间较多'],['需要非常安静或长期独处']),
  breed('poodle','贵宾犬','Poodle','dog','small','medium','low','medium','low','high','medium','high',[700,1500],[60,100],['愿意训练并承担定期美容'],['无法安排美容或互动']),
  breed('corgi','柯基犬','Pembroke Welsh Corgi','dog','medium','high','low','high','high','medium','medium','medium',[700,1400],[80,120],['有稳定运动和训练时间'],['运动时间少或难接受掉毛叫声']),
  breed('labrador','拉布拉多寻回犬','Labrador Retriever','dog','large','high','low','medium','high','medium','medium','high',[900,1800],[100,150],['空间、运动和预算充足'],['小空间且运动时间有限']),
  breed('border-collie','边境牧羊犬','Border Collie','dog','medium','high','low','medium','high','medium','high','medium',[900,1800],[120,180],['能提供大量运动与脑力训练'],['忙碌新手或低运动生活']),
  breed('american-shorthair','美国短毛猫','American Shorthair','cat','medium','medium','high','low','medium','low','low','high',[450,950],[35,65],['希望互动与独处相对平衡'],['期待每只个体都同样亲人']),
  breed('maine-coon','缅因猫','Maine Coon','cat','large','medium','medium','medium','high','high','low','high',[800,1600],[50,90],['空间、预算和梳毛时间较充足'],['预算较低或不愿频繁梳毛']),
  breed('exotic-shorthair','异国短毛猫','Exotic Shorthair','cat','medium','low','high','low','medium','medium','low','high',[700,1500],[35,70],['偏好安静室内陪伴'],['无法承担较高医疗准备成本']),
  breed('devon-rex','德文卷毛猫','Devon Rex','cat','small','high','low','medium','low','medium','medium','high',[700,1500],[55,90],['喜欢高互动并能关注环境温度'],['长期独处或希望低互动']),
  breed('chinese-dog','中华田园犬','Chinese Domestic Dog','dog','medium','medium','medium','medium','medium','low','medium','medium',[500,1100],[60,110],['愿意按具体成年个体评估'],['只凭类型名称预判性格']),
  breed('bichon','比熊犬','Bichon Frise','dog','small','medium','low','medium','low','high','medium','high',[700,1500],[60,100],['愿意稳定陪伴和定期美容'],['长期独处或不愿美容']),
  breed('golden-retriever','金毛寻回犬','Golden Retriever','dog','large','high','low','medium','high','medium','medium','high',[1000,2000],[100,150],['运动空间和预算充足的家庭'],['小空间、低运动或难接受掉毛']),
  breed('shiba-inu','柴犬','Shiba Inu','dog','medium','high','medium','medium','high','low','high','medium',[750,1500],[80,130],['愿意学习犬只行为与持续训练'],['期待训练非常轻松的新手']),
  breed('pomeranian','博美犬','Pomeranian','dog','small','medium','low','high','high','high','medium','medium',[650,1400],[50,90],['能投入梳毛、训练和叫声管理'],['需要安静或很难接受掉毛']),
  breed('schnauzer','雪纳瑞','Miniature Schnauzer','dog','small','medium','medium','high','low','high','medium','high',[700,1500],[60,100],['愿意美容和进行叫声训练'],['不愿定期美容']),
  breed('french-bulldog','法国斗牛犬','French Bulldog','dog','small','low','low','medium','medium','low','medium','medium',[900,1900],[40,70],['能严格关注温度与健康风险'],['预算较低或希望高强度户外活动']),
  breed('husky','哈士奇','Siberian Husky','dog','large','high','low','high','high','medium','high','medium',[1000,2100],[120,180],['运动、空间和训练投入很充足'],['低运动、小空间或需要安静'])
];

module.exports = { questions, chapters, breeds };
