const { withXcodeProject } = require('@expo/config-plugins');

module.exports = function withVisionOCR(config) {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const targetUuid = xcodeProject.getFirstTarget().uuid;

    const buildPhase = xcodeProject.pbxSourcesBuildPhaseObj(targetUuid);
    const alreadyAdded = Object.values(buildPhase.files || {}).some(f =>
      typeof f === 'object' && f.comment && f.comment.includes('VisionOCR')
    );

    if (alreadyAdded) return config;

    const files = [
      { name: 'VisionOCR.swift', type: 'sourcecode.swift' },
      { name: 'VisionOCR.m',     type: 'sourcecode.c.objc' },
    ];

    for (const { name, type } of files) {
      // Generate deterministic UUIDs
      const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const fileRefUuid = `AA${seed.toString(16).padStart(6, '0').toUpperCase()}00000000000000000001`;
      const buildFileUuid = `AA${seed.toString(16).padStart(6, '0').toUpperCase()}00000000000000000002`;

      // Add PBXFileReference
      xcodeProject.pbxFileReferenceSection()[fileRefUuid] = {
        isa: 'PBXFileReference',
        lastKnownFileType: type,
        name,
        path: `CodesTCG/${name}`,
        sourceTree: '"<group>"',
      };
      xcodeProject.pbxFileReferenceSection()[`${fileRefUuid}_comment`] = name;

      // Add PBXBuildFile
      xcodeProject.pbxBuildFileSection()[buildFileUuid] = {
        isa: 'PBXBuildFile',
        fileRef: fileRefUuid,
        fileRef_comment: name,
      };
      xcodeProject.pbxBuildFileSection()[`${buildFileUuid}_comment`] = `${name} in Sources`;

      // Add to Sources build phase
      buildPhase.files.push({ value: buildFileUuid, comment: `${name} in Sources` });

      // Add to main group
      const mainGroup = xcodeProject.pbxGroupByName('TCGCodeScanner');
      if (mainGroup) {
        mainGroup.children.push({ value: fileRefUuid, comment: name });
      }
    }

    return config;
  });
};
