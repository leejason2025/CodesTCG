import Foundation
import Vision
import UIKit

@objc(VisionOCR)
class VisionOCR: NSObject {

  @objc
  func recognize(_ imagePath: String,
                 resolver resolve: @escaping RCTPromiseResolveBlock,
                 rejecter reject: @escaping RCTPromiseRejectBlock) {

    DispatchQueue.global(qos: .userInitiated).async {
      let path = imagePath.hasPrefix("file://")
        ? String(imagePath.dropFirst(7))
        : imagePath

      guard let image = UIImage(contentsOfFile: path),
            let cgImage = image.cgImage else {
        reject("LOAD_ERROR", "Could not load image at path: \(path)", nil)
        return
      }

      let request = VNRecognizeTextRequest()
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = false

      let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
      do {
        try handler.perform([request])
      } catch {
        reject("OCR_ERROR", error.localizedDescription, error)
        return
      }

      var texts: [String] = []
      for obs in request.results ?? [] {
        if let candidate = obs.topCandidates(1).first {
          texts.append(candidate.string)
        }
      }

      resolve(texts.joined(separator: " "))
    }
  }

  @objc static func requiresMainQueueSetup() -> Bool { return false }
}
