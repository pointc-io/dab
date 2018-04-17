import { observable } from 'mobx'

export class ProfileModel {
  id: string
  @observable
  type: string
}

export default ProfileModel