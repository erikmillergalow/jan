'use client'

import React, { useEffect, useState } from 'react'

import ScrollToBottom from 'react-scroll-to-bottom'

import {
  Button,
  Switch,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
  Select,
  SelectContent,
  SelectItem,
  Input,
  SelectTrigger,
  SelectValue,
} from '@janhq/uikit'

import { atom, useAtom, useAtomValue } from 'jotai'

import { Paintbrush, CodeIcon } from 'lucide-react'
import { ExternalLinkIcon, InfoIcon } from 'lucide-react'

import { twMerge } from 'tailwind-merge'

import CardSidebar from '@/containers/CardSidebar'
import DropdownListSidebar, {
  selectedModelAtom,
} from '@/containers/DropdownListSidebar'

import { useActiveModel } from '@/hooks/useActiveModel'
import { useServerLog } from '@/hooks/useServerLog'

import { getConfigurationsData } from '@/utils/componentSettings'
import { toSettingParams } from '@/utils/modelParam'

import EngineSetting from '../Chat/EngineSetting'

import settingComponentBuilder from '../Chat/ModelSetting/settingComponentBuilder'

import { showRightSideBarAtom } from '../Chat/Sidebar'

import Logs from './Logs'

import { serverEnabledAtom } from '@/helpers/atoms/LocalServer.atom'
import { getActiveThreadModelParamsAtom } from '@/helpers/atoms/Thread.atom'

const corsEnabledAtom = atom(true)
const verboseEnabledAtom = atom(true)
const hostAtom = atom('127.0.0.1')
const portAtom = atom('1337')

const LocalServerScreen = () => {
  const [serverEnabled, setServerEnabled] = useAtom(serverEnabledAtom)
  const showing = useAtomValue(showRightSideBarAtom)
  const activeModelParams = useAtomValue(getActiveThreadModelParamsAtom)

  const modelEngineParams = toSettingParams(activeModelParams)

  const componentDataEngineSetting = getConfigurationsData(modelEngineParams)

  const { openServerLog, clearServerLog } = useServerLog()
  const { activeModel, startModel, stateModel } = useActiveModel()
  const [selectedModel] = useAtom(selectedModelAtom)

  const [isCorsEnabled, setIsCorsEnabled] = useAtom(corsEnabledAtom)
  const [isVerboseEnabled, setIsVerboseEnabled] = useAtom(verboseEnabledAtom)
  const [host, setHost] = useAtom(hostAtom)
  const [port, setPort] = useAtom(portAtom)

  const FIRST_TIME_VISIT_API_SERVER = 'firstTimeVisitAPIServer'

  const [firstTimeVisitAPIServer, setFirstTimeVisitAPIServer] =
    useState<boolean>(false)

  useEffect(() => {
    if (
      localStorage.getItem(FIRST_TIME_VISIT_API_SERVER) === null ||
      localStorage.getItem(FIRST_TIME_VISIT_API_SERVER) === 'true'
    ) {
      localStorage.setItem(FIRST_TIME_VISIT_API_SERVER, 'true')
      setFirstTimeVisitAPIServer(true)
    }
  }, [firstTimeVisitAPIServer])

  return (
    <div className="flex h-full w-full">
      {/* Left SideBar */}
      <div className="flex h-full w-60 flex-shrink-0 flex-col overflow-y-auto border-r border-border">
        <div className="p-4">
          <h2 className="font-bold">Server Options</h2>
          <p className="mt-2 leading-relaxed">
            Start an OpenAI-compatible local HTTP server.
          </p>
        </div>
        <div className="border-b border-border pb-8">
          <div className="space-y-3 px-4">
            <Button
              block
              themes={serverEnabled ? 'danger' : 'primary'}
              disabled={stateModel.loading}
              onClick={() => {
                if (serverEnabled) {
                  window.core?.api?.stopServer()
                  setServerEnabled(false)
                } else {
                  startModel(String(selectedModel?.id))
                  window.core?.api?.startServer({
                    host,
                    port,
                    isCorsEnabled,
                    isVerboseEnabled,
                  })
                  setServerEnabled(true)
                  if (firstTimeVisitAPIServer) {
                    localStorage.setItem(FIRST_TIME_VISIT_API_SERVER, 'false')
                    setFirstTimeVisitAPIServer(false)
                  }
                }
              }}
            >
              {serverEnabled ? 'Stop' : 'Start'} Server
            </Button>
            {serverEnabled && (
              <Button block themes="secondaryBlue" asChild>
                <a href={`http://localhost:${port}`} target="_blank">
                  API Reference <ExternalLinkIcon size={20} className="ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-4 p-4">
              <div>
                <p className="mb-2 block text-sm font-semibold text-zinc-500 dark:text-gray-300">
                  Server Options
                </p>
                <div className="flex w-full flex-shrink-0 items-center gap-x-2">
                  <Select
                    value={host}
                    onValueChange={(e) => setHost(e)}
                    disabled={serverEnabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="127.0.0.1">127.0.0.1</SelectItem>
                      <SelectItem value="0.0.0.0">0.0.0.0</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    className="w-[60px] flex-shrink-0"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    maxLength={4}
                    disabled={serverEnabled}
                  />
                </div>
              </div>
              <div>
                <label
                  id="cors"
                  className="mb-2 inline-flex items-start gap-x-2 font-bold text-zinc-500 dark:text-gray-300"
                >
                  Cross-Origin-Resource-Sharing (CORS)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon
                        size={16}
                        className="mt-0.5 flex-shrink-0 dark:text-gray-500"
                      />
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent side="top" className="max-w-[240px]">
                        <span>
                          CORS (Cross-Origin Resource Sharing) manages resource
                          access on this server from external domains. Enable
                          for secure inter-website communication, regulating
                          data sharing to bolster overall security.
                        </span>
                        <TooltipArrow />
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </label>
                <div className="flex items-center justify-between">
                  <Switch
                    checked={isCorsEnabled}
                    onCheckedChange={(e) => setIsCorsEnabled(e)}
                    name="cors"
                    disabled={serverEnabled}
                  />
                </div>
              </div>
              <div>
                <label
                  id="verbose"
                  className="mb-2 inline-flex items-start gap-x-2 font-bold text-zinc-500 dark:text-gray-300"
                >
                  Verbose Server Logs
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon
                        size={16}
                        className="mt-0.5 flex-shrink-0 dark:text-gray-500"
                      />
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent side="top" className="max-w-[240px]">
                        <span>
                          Verbose Server Logs provide extensive details about
                          server activities. Enable to capture thorough records,
                          aiding in troubleshooting and monitoring server
                          performance effectively.
                        </span>
                        <TooltipArrow />
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </label>
                <div className="flex items-center justify-between">
                  <Switch
                    checked={isVerboseEnabled}
                    onCheckedChange={(e) => setIsVerboseEnabled(e)}
                    name="verbose"
                    disabled={serverEnabled}
                  />
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipPortal>
            {serverEnabled && (
              <TooltipContent side="bottom" className="max-w-[200px]">
                <span>
                  Settings cannot be modified while the server is running
                </span>
                <TooltipArrow />
              </TooltipContent>
            )}
          </TooltipPortal>
        </Tooltip>
      </div>

      {/* Middle Bar */}
      <ScrollToBottom className="relative flex h-full w-full flex-col overflow-auto bg-background">
        <div className="sticky top-0 flex  items-center justify-between bg-zinc-100 px-4 py-2 dark:bg-secondary/30">
          <h2 className="font-bold">Server Logs</h2>
          <div className="space-x-2">
            <Button
              size="sm"
              themes="outline"
              className="bg-white dark:bg-secondary"
              onClick={() => openServerLog()}
            >
              <CodeIcon size={16} className="mr-2" />
              Open Logs
            </Button>
            <Button
              size="sm"
              themes="outline"
              className="bg-white dark:bg-secondary"
              onClick={() => clearServerLog()}
            >
              <Paintbrush size={16} className="mr-2" />
              Clear
            </Button>
          </div>
        </div>
        {firstTimeVisitAPIServer ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-[335px] rounded-lg border border-blue-600 bg-blue-100 p-6">
              <div className="item-start flex gap-x-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="mt-1 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 2.11188e-08 4.47715 2.11188e-08 10C2.11188e-08 12.397 0.843343 14.597 2.2495 16.3195L0.292453 18.2929C-0.332289 18.9229 0.110179 20 0.993697 20H10ZM5.5 8C5.5 7.44772 5.94772 7 6.5 7H13.5C14.0523 7 14.5 7.44772 14.5 8C14.5 8.55229 14.0523 9 13.5 9H6.5C5.94772 9 5.5 8.55229 5.5 8ZM6.5 11C5.94772 11 5.5 11.4477 5.5 12C5.5 12.5523 5.94772 13 6.5 13H9.5C10.0523 13 10.5 12.5523 10.5 12C10.5 11.4477 10.0523 11 9.5 11H6.5Z"
                    fill="#2563EB"
                  />
                </svg>

                <div>
                  <h6 className="font-medium text-black">
                    Once you start the server, you cannot chat with your
                    assistant.
                  </h6>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      localStorage.setItem(FIRST_TIME_VISIT_API_SERVER, 'false')
                      setFirstTimeVisitAPIServer(false)
                    }}
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Logs />
        )}
      </ScrollToBottom>

      {/* Right bar */}
      <div
        className={twMerge(
          'h-full flex-shrink-0 overflow-x-hidden border-l border-border bg-background transition-all duration-100 dark:bg-background/20',
          showing
            ? 'w-80 translate-x-0 opacity-100'
            : 'w-0 translate-x-full opacity-0'
        )}
      >
        <div className="px-4">
          <div className="mt-4">
            <DropdownListSidebar />
          </div>

          {componentDataEngineSetting.filter(
            (x) => x.name === 'prompt_template'
          ).length !== 0 && (
            <div className="mt-4">
              <CardSidebar title="Model Parameters" asChild>
                <div className="px-2 py-4">
                  {settingComponentBuilder(componentDataEngineSetting, true)}
                </div>
              </CardSidebar>
            </div>
          )}

          {componentDataEngineSetting.length !== 0 && (
            <div className="my-4">
              <CardSidebar title="Engine Parameters" asChild>
                <div className="px-2 py-4">
                  <EngineSetting />
                </div>
              </CardSidebar>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocalServerScreen
