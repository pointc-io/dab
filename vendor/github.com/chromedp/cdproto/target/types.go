package target

// Code generated by cdproto-gen. DO NOT EDIT.

// ID [no description].
type ID string

// String returns the ID as string value.
func (t ID) String() string {
	return string(t)
}

// SessionID unique identifier of attached debugging session.
type SessionID string

// String returns the SessionID as string value.
func (t SessionID) String() string {
	return string(t)
}

// BrowserContextID [no description].
type BrowserContextID string

// String returns the BrowserContextID as string value.
func (t BrowserContextID) String() string {
	return string(t)
}

// Info [no description].
type Info struct {
	TargetID ID     `json:"targetId"`
	Type     string `json:"type"`
	Title    string `json:"title"`
	URL      string `json:"url"`
	Attached bool   `json:"attached"`           // Whether the target has an attached client.
	OpenerID ID     `json:"openerId,omitempty"` // Opener target Id
}

// RemoteLocation [no description].
type RemoteLocation struct {
	Host string `json:"host"`
	Port int64  `json:"port"`
}
