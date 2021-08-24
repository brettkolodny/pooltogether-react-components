import React from 'react'
import classnames from 'classnames'
import {
  useOnboard,
  useIsWalletMetamask,
  useAddNetworkToMetamask,
  useIsWalletOnNetwork,
  useIsWalletOnSupportedNetwork
} from '@pooltogether/hooks'
import { ETHEREUM_NETWORKS, getNetworkNiceNameByChainId } from '@pooltogether/utilities'

import { Tooltip, Modal, NetworkIcon } from '../../..'

export const NetworkModal = (props) => {
  const { t, isOpen, closeModal, supportedNetworks } = props

  const { network: chainId, provider, onboard } = useOnboard()
  const isWalletMetamask = useIsWalletMetamask()
  const currentNetworkName = getNetworkNiceNameByChainId(chainId)
  const isWalletOnSupportedNetwork = useIsWalletOnSupportedNetwork(supportedNetworks)

  console.log(provider)

  if (isWalletMetamask) {
    return (
      <Modal isOpen={isOpen} closeModal={closeModal} label='network modal'>
        <Container>
          <Header>{t?.('chooseANetwork') || 'Choose a Network'}</Header>
          <Description>
            {t?.('selectASupportedNetworkMetamask') ||
              'Select a supported network to be prompted to switch in your MetaMask wallet.'}
          </Description>
          {supportedNetworks.map((chainId) => (
            <NetworkButton t={t} key={chainId} chainId={chainId} />
          ))}
          <CurrentlyConnectedTo
            t={t}
            currentNetworkName={currentNetworkName}
            isWalletOnSupportedNetwork={isWalletOnSupportedNetwork}
          />
        </Container>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} label='network modal'>
      <button
        onClick={async () => {
          try {
            const pgon = 137
            console.log(provider, {
              approved: false,
              chainId: '0x' + pgon.toString(16),
              accounts: provider?.provider.accounts
            })
            await provider?.provider.request({
              method: 'wc_sessionUpdate',
              params: [
                {
                  approved: true,
                  chainId: 137,
                  accounts: provider?.provider.accounts
                }
              ]
            })
          } catch (e) {
            // Could not switch networks so proceed as normal through the checks
            console.log("Can't switch", e)
          }
        }}
      >
        Try to change
      </button>
      <Container>
        <Header>{t?.('supportedNetworks') || 'Suported Networks'}</Header>
        <Description>
          {t?.('pleaseSwitchToASupportedNetwork') ||
            'Please switch to a supported network in your wallet.'}
        </Description>
        {supportedNetworks.map((chainId) => (
          <NetworkItem t={t} key={chainId} chainId={chainId} />
        ))}
        <CurrentlyConnectedTo
          t={t}
          currentNetworkName={currentNetworkName}
          isWalletOnSupportedNetwork={isWalletOnSupportedNetwork}
        />
      </Container>
    </Modal>
  )
}

const Container = (props) => <div className='flex flex-col h-full p-4'>{props.children}</div>
const Header = (props) => <h5 className='text-accent-1'>{props.children}</h5>
const Description = (props) => <p className='mb-4 text-sm text-accent-1'>{props.children}</p>
const CurrentlyConnectedTo = (props) => (
  <p className='text-xxxs mt-auto'>
    {props.t?.('currentlyConnectedTo') || 'Currently connected to:'}
    <b className={classnames({ 'ml-1 text-red': !props.isWalletOnSupportedNetwork })}>
      {props.currentNetworkName}
    </b>
  </p>
)

const NetworkItem = (props) => {
  const { chainId } = props

  const isCurrentNetwork = useIsWalletOnNetwork(chainId)
  const networkName = getNetworkNiceNameByChainId(chainId)

  return (
    <div
      className={classnames('flex justify-center mb-4 last:mb-0 w-full text-center py-2 rounded', {
        'pool-gradient-1': isCurrentNetwork,
        'bg-body': !isCurrentNetwork
      })}
    >
      <NetworkIcon chainId={chainId} className='my-auto mr-2' />
      <span className='my-auto'>{networkName}</span>
    </div>
  )
}

const NetworkButton = (props) => {
  const { chainId, t } = props

  const isCurrentNetwork = useIsWalletOnNetwork(chainId)
  const networkName = getNetworkNiceNameByChainId(chainId)
  const addNetwork = useAddNetworkToMetamask(chainId)

  const disabled = ETHEREUM_NETWORKS.includes(chainId)
  let toolTip
  if (disabled) {
    toolTip =
      t?.('manuallyChangeNetwork') || 'You have to manually switch to this network with your wallet'
  }

  return (
    <div className='flex mb-4 last:mb-0'>
      <button
        className={classnames('w-full flex justify-center py-2 rounded trans', {
          'pool-gradient-1 text-white hover:text-white': isCurrentNetwork,
          'bg-body border border-body hover:border-accent-3': !isCurrentNetwork && !disabled,
          'bg-body': !isCurrentNetwork && disabled,
          '': disabled
        })}
        type='button'
        onClick={addNetwork}
        disabled={disabled}
      >
        <NetworkIcon chainId={chainId} className='mr-2' />
        <span className='my-auto'>{networkName}</span>
        {toolTip && (
          <Tooltip
            tip={toolTip}
            id={`${chainId}-network-button`}
            className='flex'
            iconClassName='mx-2 my-auto'
          />
        )}
      </button>
    </div>
  )
}
