const { withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withVisionOCR(config) {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const iosDir = path.join(projectRoot, 'ios', 'CodesTCG');
    const srcDir = path.join(projectRoot, '..', 'modules', 'VisionOCR');

    // Copy files into ios/ so Xcode can find them
    for (const name of ['VisionOCR.swift', 'VisionOCR.m']) {
      const src = path.join(srcDir, name);
      const dest = path.join(iosDir, name);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }

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
      const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const fileRefUuid = `AA${seed.toString(16).padStart(6, '0').toUpperCase()}00000000000000000001`;
      const buildFileUuid = `AA${seed.toString(16).padStart(6, '0').toUpperCase()}00000000000000000002`;

      xcodeProject.pbxFileReferenceSection()[fileRefUuid] = {
        isa: 'PBXFileReference',
        lastKnownFileType: type,
        name,
        path: `CodesTCG/${name}`,
        sourceTree: '"<group>"',
      };
      xcodeProject.pbxFileReferenceSection()[`${fileRefUuid}_comment`] = name;

      xcodeProject.pbxBuildFileSection()[buildFileUuid] = {
        isa: 'PBXBuildFile',
        fileRef: fileRefUuid,
        fileRef_comment: name,
      };
      xcodeProject.pbxBuildFileSection()[`${buildFileUuid}_comment`] = `${name} in Sources`;

      buildPhase.files.push({ value: buildFileUuid, comment: `${name} in Sources` });

      const mainGroup = xcodeProject.pbxGroupByName('CodesTCG');
      if (mainGroup) {
        mainGroup.children.push({ value: fileRefUuid, comment: name });
      }
    }

    return config;
  });
};
