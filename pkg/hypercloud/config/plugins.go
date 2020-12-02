package config

import "k8s.io/apimachinery/pkg/runtime"

// +k8s:deepcopy-gen=false

// PluginConf holds the plugin configuration.
type PluginConf map[string]interface{}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *PluginConf) DeepCopyInto(out *PluginConf) {
	if in == nil {
		*out = nil
	} else {
		*out = runtime.DeepCopyJSON(*in)
	}
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new PluginConf.
func (in *PluginConf) DeepCopy() *PluginConf {
	if in == nil {
		return nil
	}
	out := new(PluginConf)
	in.DeepCopyInto(out)
	return out
}
