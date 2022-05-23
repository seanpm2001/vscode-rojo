import * as childProcess from "child_process"
import { promisify } from "util"
import * as which from "which"
import { ProjectFile } from "./findProjectFiles"
import path = require("path")

const exec = promisify(childProcess.exec)

export enum InstallType {
  aftman = "Aftman",
  foreman = "Foreman",
  global = "global",
}
export type RojoInstall = {
  version: string
  installType: InstallType
  resolvedPath: string
}

function getInstallType(resolvedPath: string) {
  if (resolvedPath.includes(".aftman")) {
    return InstallType.aftman
  } else if (resolvedPath.includes(".foreman")) {
    return InstallType.foreman
  }

  return InstallType.global
}

export async function getRojoInstall(
  projectFile: ProjectFile
): Promise<RojoInstall | null> {
  const projectFilePath = projectFile.path.fsPath
  const projectFileFolder = path.dirname(projectFilePath)

  const output = await exec("rojo --version", {
    cwd: projectFileFolder,
  }).catch(() => null)

  if (output) {
    if (output.stderr.length > 0) {
      console.error("Rojo version resulted in stderr output")
      return null
    }

    const split = output.stdout.split(" ")

    const version = split[1]

    if (!version) {
      return null
    }

    const resolvedPath = await which("rojo")

    return {
      version,
      installType: getInstallType(resolvedPath),
      resolvedPath,
    }
  } else {
    return null
  }
}
